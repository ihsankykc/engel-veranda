<?php

// Basic security and setup
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    // Recipient
    $to = "engelveranda@gmail.com";
    $subject = "📩 New Offer Request from Safran Veranda Website";

    // Sanitize contact info
    $name = htmlspecialchars($_POST["name"] ?? '');
    $email = htmlspecialchars($_POST["email"] ?? '');
    $phone = htmlspecialchars($_POST["phone"] ?? '');
    $street = htmlspecialchars($_POST["streetAddress"] ?? '');
    $postcodeCity = htmlspecialchars($_POST["postcodeCity"] ?? '');

    // Start message body
    $body = "<h2>Contact Details</h2>";
    $body .= "<strong>Name:</strong> $name<br>";
    $body .= "<strong>Email:</strong> $email<br>";
    $body .= "<strong>Phone:</strong> $phone<br>";
    $body .= "<strong>Street Address:</strong> $street<br>";
    $body .= "<strong>Postcode & City:</strong> $postcodeCity<br><br>";

    $body .= "<h2>Product Information</h2>";

    // Append all other fields dynamically (except photos)
    foreach ($_POST as $key => $value) {
        if (in_array($key, ["name", "email", "phone", "streetAddress", "postcodeCity", "customMessage"])) continue;

        // Handle checkboxes like 'glassType' that may come as arrays
        if (is_array($value)) {
            $value = implode(", ", array_map("htmlspecialchars", $value));
        } else {
            $value = htmlspecialchars($value);
        }

        $keyFormatted = ucwords(str_replace("_", " ", $key));
        $body .= "<strong>$keyFormatted:</strong> $value<br>";
    }

    // Custom free-text message
    if (!empty($_POST["customMessage"])) {
        $body .= "<br><strong>Custom Message:</strong><br>" . nl2br(htmlspecialchars($_POST["customMessage"])) . "<br>";
    }

    // Set email headers
    $headers = "From: $email\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    // Handle file uploads (photos)
    $attachments = [];
    if (!empty($_FILES['photos']) && is_array($_FILES['photos']['tmp_name'])) {
        foreach ($_FILES['photos']['tmp_name'] as $index => $tmpName) {
            if (is_uploaded_file($tmpName)) {
                $attachments[] = [
                    'tmp_name' => $tmpName,
                    'name' => $_FILES['photos']['name'][$index],
                    'type' => $_FILES['photos']['type'][$index]
                ];
            }
        }
    }

    // If attachments exist, send as multipart email
    if (count($attachments) > 0) {
        $boundary = md5(uniqid(time()));

        $headers = "From: $email\r\n";
        $headers .= "Reply-To: $email\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n";

        $message = "--{$boundary}\r\n";
        $message .= "Content-Type: text/html; charset=UTF-8\r\n";
        $message .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
        $message .= $body . "\r\n";

        foreach ($attachments as $file) {
            $fileData = file_get_contents($file['tmp_name']);
            $fileContent = chunk_split(base64_encode($fileData));

            $message .= "--{$boundary}\r\n";
            $message .= "Content-Type: {$file['type']}; name=\"{$file['name']}\"\r\n";
            $message .= "Content-Disposition: attachment; filename=\"{$file['name']}\"\r\n";
            $message .= "Content-Transfer-Encoding: base64\r\n\r\n";
            $message .= $fileContent . "\r\n";
        }

        $message .= "--{$boundary}--";

        $success = mail($to, $subject, $message, $headers);
    } else {
        // Simple email without attachments
        $success = mail($to, $subject, $body, $headers);
    }

    echo $success ? "success" : "error";
}
?>
