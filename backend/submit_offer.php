<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $to = "engelveranda@gmail.com"; // 🔁 Replace this with your actual email
    $subject = "📩 New Offer Request from Safran Veranda";

    // Sanitize and collect key fields
    $name = htmlspecialchars($_POST["name"] ?? '');
    $email = htmlspecialchars($_POST["email"] ?? '');
    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";

    // Prepare HTML message
    $body = "<h2>New Offer Request</h2><ul>";
    foreach ($_POST as $key => $value) {
        if (is_array($value)) {
            $value = implode(", ", array_map("htmlspecialchars", $value));
        } else {
            $value = htmlspecialchars($value);
        }
        $body .= "<li><strong>" . ucfirst($key) . ":</strong> $value</li>";
    }
    $body .= "</ul>";

    // -- Handle file attachments --
    $boundary = md5(time());
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

    $message = "--$boundary\r\n";
    $message .= "Content-Type: text/html; charset=UTF-8\r\n";
    $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $message .= $body . "\r\n";

    if (!empty($_FILES['photos']) && is_array($_FILES['photos']['tmp_name'])) {
        foreach ($_FILES['photos']['tmp_name'] as $index => $tmpName) {
            if (is_uploaded_file($tmpName)) {
                $fileName = $_FILES['photos']['name'][$index];
                $fileType = $_FILES['photos']['type'][$index];
                $fileData = chunk_split(base64_encode(file_get_contents($tmpName)));

                $message .= "--$boundary\r\n";
                $message .= "Content-Type: $fileType; name=\"$fileName\"\r\n";
                $message .= "Content-Disposition: attachment; filename=\"$fileName\"\r\n";
                $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
                $message .= $fileData . "\r\n";
            }
        }
    }

    $message .= "--$boundary--";

    // Send email
    $sent = mail($to, $subject, $message, $headers);
    echo $sent ? "success" : "error";
}
?>
