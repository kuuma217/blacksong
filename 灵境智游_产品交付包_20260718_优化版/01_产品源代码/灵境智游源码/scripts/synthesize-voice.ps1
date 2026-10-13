param(
  [Parameter(Mandatory = $true)][string]$Voice,
  [Parameter(Mandatory = $true)][double]$Rate,
  [Parameter(Mandatory = $true)][double]$Pitch,
  [Parameter(Mandatory = $true)][double]$Volume,
  [Parameter(Mandatory = $true)][string]$TextBase64,
  [Parameter(Mandatory = $true)][string]$Output
)

$ErrorActionPreference = "Stop"
$text = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($TextBase64)).Trim()
if ([string]::IsNullOrWhiteSpace($text)) {
  throw "Speech text is empty."
}

Add-Type -AssemblyName System.Runtime.WindowsRuntime
[Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media.SpeechSynthesis, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.SpeechSynthesis.SpeechSynthesisStream, Windows.Media.SpeechSynthesis, ContentType = WindowsRuntime] | Out-Null

$synthesizer = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer
try {
  $selectedVoice = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices |
    Where-Object { $_.DisplayName -eq $Voice } |
    Select-Object -First 1

  if (-not $selectedVoice) {
    throw "Requested OneCore voice is unavailable: $Voice"
  }

  $synthesizer.Voice = $selectedVoice
  $synthesizer.Options.SpeakingRate = [Math]::Min(3.0, [Math]::Max(0.5, $Rate))
  $synthesizer.Options.AudioPitch = [Math]::Min(2.0, [Math]::Max(0.5, $Pitch))
  $synthesizer.Options.AudioVolume = [Math]::Min(1.0, [Math]::Max(0.1, $Volume))

  $operation = $synthesizer.SynthesizeTextToStreamAsync($text)
  $asTaskMethod = [System.WindowsRuntimeSystemExtensions].GetMethods() |
    Where-Object {
      $_.Name -eq "AsTask" -and
      $_.IsGenericMethodDefinition -and
      $_.GetParameters().Count -eq 1
    } |
    Select-Object -First 1
  $asTask = $asTaskMethod.MakeGenericMethod([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])
  $task = $asTask.Invoke($null, @($operation))
  $task.Wait()

  $speechStream = $task.Result
  try {
    $inputStream = [System.IO.WindowsRuntimeStreamExtensions]::AsStreamForRead($speechStream)
    try {
      $fileStream = [System.IO.File]::Create($Output)
      try {
        $inputStream.CopyTo($fileStream)
      } finally {
        $fileStream.Dispose()
      }
    } finally {
      $inputStream.Dispose()
    }
  } finally {
    $speechStream.Dispose()
  }
} finally {
  $synthesizer.Dispose()
}
