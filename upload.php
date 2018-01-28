<?php

$name = "image";

if (($_FILES[$name]["type"] == "image/png") || true)
{
    if ($_FILES[$name]["error"] > 0)
    {
        echo "Return Code: " . $_FILES["file"]["error"] . "<br />";
    }
    else
    {
        $ext = substr($_FILES[$name]["name"], strrpos($_FILES[$name]["name"], '.') + 1);
        $fileName = "upload/" . rand(1000,1000000).".".$ext;
        if (file_exists($fileName))
        {
            echo $_FILES[$name]["name"] . " already exists. ";
        }
        else
        {
            move_uploaded_file($_FILES[$name]["tmp_name"],
                $fileName);

            header('Content-Type: application/json');

            echo  json_encode([
                "code"=>0,
                "src"=>$fileName,
                "alt"=>$_FILES[$name]["name"],
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