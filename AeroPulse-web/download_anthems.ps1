$baseDir = "c:\Users\thanthtet.myet\Documents\01_Willowglen\B_001_Workplace\AeroPulse\AeroPulse-web\public\anthems"
$baseUrl = "http://www.nationalanthems.info/"

$anthems = @{
    "usa"         = "us";
    "uk"          = "gb";
    "japan"       = "jp";
    "china"       = "cn";
    "germany"     = "de";
    "france"      = "fr";
    "italy"       = "it";
    "india"       = "in";
    "brazil"      = "br";
    "canada"      = "ca";
    "australia"   = "au";
    "south_korea" = "kr";
    "russia"      = "ru";
    "spain"       = "es";
    "mexico"      = "mx";
    "netherlands" = "nl";
    "sweden"      = "se";
    "norway"      = "no";
    "switzerland" = "ch";
    "singapore"   = "sg";
    "thailand"    = "th";
    "vietnam"     = "vn";
    "indonesia"   = "id";
    "philippines" = "ph";
    "myanmar"     = "mm";
    "turkey"      = "tr";
    "israel"      = "il";
    "uae"         = "ae";
    "pakistan"    = "pk";
    "bangladesh"  = "bd";
    "greece"      = "gr";
    "poland"      = "pl";
    "ukraine"     = "ua";
    "argentina"   = "ar";
    "belgium"     = "be";
    "ireland"     = "ie";
    "austria"     = "at";
    "denmark"     = "dk";
    "finland"     = "fi";
    "czech"       = "cz";
    "portugal"    = "pt";
    "newzealand"  = "nz";
    "southafrica" = "za";
    "malaysia"    = "my";
    "saudi"       = "sa";
}

foreach ($key in $anthems.Keys) {
    echo "Downloading anthem for $key..."
    $code = $anthems[$key]
    $url = "$baseUrl$code.mp3"
    $output = "$baseDir\$key.mp3"
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -TimeoutSec 10
    }
    catch {
        echo "Failed to download $key from $url"
        # Try a fallback pattern if needed, but for now just logging errors
    }
}
