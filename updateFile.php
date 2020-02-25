<?php
    $data = $_POST["data"];
    $file = fopen("report.txt", "w+");
    fwrite($file, $data);
    fclose($file);
?>