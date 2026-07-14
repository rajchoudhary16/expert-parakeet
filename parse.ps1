$tokens = $null
$errors = $null
[System.Management.Automation.Language.Parser]::ParseFile("E:\RajOffer\Event\app.js", [ref]$tokens, [ref]$errors) | Out-Null
if ($errors) {
  $errors | Format-List *
}
