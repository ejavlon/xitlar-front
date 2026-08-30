param([int]$start, [int]$end)
$lines = Get-Content 'src/app/admin/page.tsx'
for ($i = $start; $i -le $end; $i++) {
  Write-Host ("{0,4}: {1}" -f $i, $lines[$i])
}