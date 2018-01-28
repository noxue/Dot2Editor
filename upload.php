<?php

if (($_FILES["file"]["type"] == "image/png") || true)
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

        $ext = substr($_FILES["file"]["name"], strrpos($_FILES["file"]["name"], '.') + 1);
        $fileName = "upload/" . rand(1000,1000000).".".$ext;
        if (file_exists($fileName))
        {
            echo $_FILES["file"]["name"] . " already exists. ";
        }
        else
        {
            move_uploaded_file($_FILES["file"]["tmp_name"],
                $fileName);

            header('Content-Type: application/json');

            echo  json_encode([
                "code"=>0,
                "src"=>$fileName,
                "alt"=>$_FILES["file"]["name"],
                "isImage"=>in_array(strtolower($ext),["jpg","gif","jpeg","bmp","png"]),
                "errMsg"=>""
            ]);
        }
    }
}
else
{
    echo "Invalid file";
}
?>