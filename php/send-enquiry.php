<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $code, string $message, bool $success = false): never {
    http_response_code($code);
    echo json_encode(['success' => $success, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, 'Method not allowed.');
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) respond(415, 'JSON required.');
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 10000) respond(413, 'Request too large.');

$data = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($data)) respond(400, 'Invalid JSON.');
$name = trim((string)($data['name'] ?? ''));
$phone = preg_replace('/[\s()\-]/', '', (string)($data['phone'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$configuration = (string)($data['configuration'] ?? '');
$message = trim((string)($data['message'] ?? ''));
$consent = ($data['consent'] ?? false) === true;

if (mb_strlen($name) < 2 || mb_strlen($name) > 80 || !preg_match('/^[\p{L} .\'-]+$/u', $name)) respond(422, 'Invalid name.');
if (!preg_match('/^\+?[0-9]{10,15}$/', $phone)) respond(422, 'Invalid phone.');
if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) respond(422, 'Invalid email.');
if (!in_array($configuration, ['1 BHK','2 BHK','3 BHK','Penthouse','Need guidance'], true)) respond(422, 'Invalid configuration.');
if (mb_strlen($message) > 1000) respond(422, 'Message too long.');
if (!$consent) respond(422, 'Consent is required.');

$configFile = __DIR__ . '/config.php';

if (!is_file($configFile)) {
    respond(503, 'Mail server is not configured.');
}

require_once __DIR__ . '/PHPMailer/Exception.php';
require_once __DIR__ . '/PHPMailer/PHPMailer.php';
require_once __DIR__ . '/PHPMailer/SMTP.php';

$config = require $configFile;

try {
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->SMTPAuth = true;
    $mail->Username = $config['smtp_user'];
    $mail->Password = $config['smtp_password'];
    $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = (int)$config['smtp_port'];
    $mail->CharSet = 'UTF-8';
    $mail->setFrom($config['mail_from'], $config['mail_from_name']);
    $mail->addReplyTo($email, $name);
    foreach ((array)$config['mail_to'] as $recipient) $mail->addAddress($recipient);
    $mail->Subject = 'New Amrit Aarogyam Enquiry - ' . $configuration;
    $mail->Body = "New website lead\n\nName: {$name}\nPhone: {$phone}\nEmail: {$email}\nConfiguration: {$configuration}\nMessage: {$message}\nConsent: Yes\n";
    $mail->send();
    respond(200, 'Enquiry sent successfully.', true);
} catch (Throwable $exception) {
    error_log('Amrit Aarogyam SMTP failure: ' . $exception->getMessage());
    respond(500, 'Unable to deliver enquiry right now.');
}
