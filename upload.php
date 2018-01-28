<?php

if (($_FILES["file"]["type"] == "image/png")
    && ($_FILES["file"]["size"] < 20000000))
{
    if ($_FILES["file"]["error"] > 0)
    {
        echo "Return Code: " . $_FILES["file"]["error"] . "<br />";
    }
    else
    {
//        echo "Upload: " . $_FILES["file"]["name"] . "<br />";
//        echo "Type: " . $_FILES["file"]["type"] . "<br />";
//        echo "Size: " . ($_FILES["file"]["size"] / 1024) . " Kb<br />";
//        echo "Temp file: " . $_FILES["file"]["tmp_name"] . "<br />";

        $fileName = "upload/" . rand(1000,1000000).".".substr($_FILES["file"]["name"], strrpos($_FILES["file"]["name"], '.') + 1);;
        if (file_exists($fileName))
        {
            echo $_FILES["file"]["name"] . " already exists. ";
        }
        else
        {
            move_uploaded_file($_FILES["file"]["tmp_name"],
                $fileName);
            echo  $fileName;
        }
    }
}
else
{
    echo "Invalid file";
}
?>