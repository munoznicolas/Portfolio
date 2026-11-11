param(
    [string]$OutputPath = "C:\repos\Portfolio\public\images\bellview-preview.png"
)

Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase

$xamlString = @"
<Border xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Width="480" Height="680" Background="#1C1C1E" CornerRadius="16" BorderBrush="#38383A" BorderThickness="1.5">
    <Grid Margin="20">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>

        <Grid Grid.Row="0" Margin="0,0,0,16">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="*"/>
                <ColumnDefinition Width="Auto"/>
            </Grid.ColumnDefinitions>
            <StackPanel Grid.Column="0">
                <StackPanel Orientation="Horizontal">
                    <TextBlock Text="🔔" FontSize="18" Margin="0,0,8,0" VerticalAlignment="Center"/>
                    <TextBlock Text="100 - Front Gate (Intercom)" FontSize="18" FontWeight="SemiBold" Foreground="#FFFFFF" FontFamily="Segoe UI Variable Display, Segoe UI"/>
                </StackPanel>
                <TextBlock Text="Incoming video call — Early-media streaming" FontSize="12" Foreground="#98989D" Margin="26,4,0,0" FontFamily="Segoe UI Variable Text, Segoe UI"/>
            </StackPanel>
            <Border Grid.Column="1" Background="#2C2C2E" CornerRadius="6" Width="28" Height="28">
                <TextBlock Text="✕" FontSize="12" FontWeight="Bold" Foreground="#98989D" HorizontalAlignment="Center" VerticalAlignment="Center"/>
            </Border>
        </Grid>

        <Border Grid.Row="1" Background="#0A0A0C" BorderBrush="#2A2A2E" BorderThickness="1" CornerRadius="10" ClipToBounds="True">
            <Grid>
                <Rectangle>
                    <Rectangle.Fill>
                        <LinearGradientBrush StartPoint="0,0" EndPoint="1,1">
                            <GradientStop Color="#141E30" Offset="0"/>
                            <GradientStop Color="#243B55" Offset="1"/>
                        </LinearGradientBrush>
                    </Rectangle.Fill>
                </Rectangle>
                <Border HorizontalAlignment="Left" VerticalAlignment="Top" Margin="12" Background="#80000000" CornerRadius="4" Padding="6,3">
                    <StackPanel Orientation="Horizontal">
                        <Ellipse Width="8" Height="8" Fill="#4CAF50" Margin="0,0,6,0" VerticalAlignment="Center"/>
                        <TextBlock Text="LIVE 1080p · H.264 RTP Early-Media" FontSize="10" FontWeight="Bold" Foreground="#81C784" FontFamily="Consolas"/>
                    </StackPanel>
                </Border>
                <Border HorizontalAlignment="Right" VerticalAlignment="Top" Margin="12" Background="#80000000" CornerRadius="4" Padding="6,3">
                    <TextBlock Text="SIP: 100@gate.local" FontSize="10" Foreground="#E0E0E0" FontFamily="Consolas"/>
                </Border>
                <StackPanel HorizontalAlignment="Center" VerticalAlignment="Center">
                    <Border Width="110" Height="110" CornerRadius="55" Background="#20FFFFFF" BorderBrush="#40FFFFFF" BorderThickness="2" Margin="0,0,0,12">
                        <TextBlock Text="👤" FontSize="56" HorizontalAlignment="Center" VerticalAlignment="Center" Opacity="0.85"/>
                    </Border>
                    <TextBlock Text="Front Gate Doorbell Station" FontSize="14" FontWeight="SemiBold" Foreground="#FFFFFF" HorizontalAlignment="Center"/>
                    <TextBlock Text="SIP Audio/Video Session Active" FontSize="11" Foreground="#90CAF9" HorizontalAlignment="Center" Margin="0,2,0,0"/>
                </StackPanel>
                <Border HorizontalAlignment="Stretch" VerticalAlignment="Bottom" Background="#90000000" Padding="12,6">
                    <Grid>
                        <TextBlock Text="DirectShow Render · Jitter: 1.2ms · Loss: 0.0%" FontSize="10" Foreground="#B0BEC5" FontFamily="Consolas"/>
                        <TextBlock Text="Bitrate: 2.4 Mbps" FontSize="10" Foreground="#B0BEC5" FontFamily="Consolas" HorizontalAlignment="Right"/>
                    </Grid>
                </Border>
            </Grid>
        </Border>

        <Border Grid.Row="2" Margin="0,12,0,12" Padding="12,8" CornerRadius="8" Background="#2C2C2E" BorderBrush="#38383A" BorderThickness="1">
            <StackPanel Orientation="Horizontal" HorizontalAlignment="Center">
                <TextBlock Text="⚡" FontSize="13" Margin="0,0,6,0" VerticalAlignment="Center"/>
                <TextBlock Text="Door station ringing — Press Space to Unlock or Enter to Answer" FontSize="12" FontWeight="SemiBold" Foreground="#81C784" FontFamily="Segoe UI Variable Text, Segoe UI"/>
            </StackPanel>
        </Border>

        <Border Grid.Row="3" Background="#107C41" BorderBrush="#20FFFFFF" BorderThickness="1" CornerRadius="8" Height="50" Margin="0,0,0,10">
            <StackPanel Orientation="Horizontal" HorizontalAlignment="Center" VerticalAlignment="Center">
                <TextBlock Text="🔑" FontSize="18" Margin="0,0,10,0" VerticalAlignment="Center"/>
                <TextBlock Text="UNLOCK DOOR" FontWeight="Bold" FontSize="15" Foreground="#FFFFFF" VerticalAlignment="Center" FontFamily="Segoe UI Variable Display, Segoe UI"/>
                <Border Background="#25FFFFFF" CornerRadius="4" Padding="6,2" Margin="10,0,0,0" VerticalAlignment="Center">
                    <TextBlock Text="Space / U" FontSize="11" FontWeight="SemiBold" Foreground="#FFFFFF"/>
                </Border>
            </StackPanel>
        </Border>

        <Grid Grid.Row="4" Margin="0,0,0,12">
            <Grid.ColumnDefinitions>
                <ColumnDefinition Width="*"/>
                <ColumnDefinition Width="10"/>
                <ColumnDefinition Width="*"/>
            </Grid.ColumnDefinitions>
            <Border Grid.Column="0" Background="#0078D4" BorderBrush="#20FFFFFF" BorderThickness="1" CornerRadius="8" Height="46">
                <StackPanel Orientation="Horizontal" HorizontalAlignment="Center" VerticalAlignment="Center">
                    <TextBlock Text="📞" FontSize="15" Margin="0,0,6,0" VerticalAlignment="Center"/>
                    <TextBlock Text="Answer Call" FontWeight="SemiBold" FontSize="13" Foreground="#FFFFFF" VerticalAlignment="Center"/>
                    <TextBlock Text="[Enter]" FontSize="11" Foreground="#CCFFFFFF" Margin="6,2,0,0" VerticalAlignment="Center"/>
                </StackPanel>
            </Border>
            <Border Grid.Column="2" Background="#D13438" BorderBrush="#20FFFFFF" BorderThickness="1" CornerRadius="8" Height="46">
                <StackPanel Orientation="Horizontal" HorizontalAlignment="Center" VerticalAlignment="Center">
                    <TextBlock Text="✕" FontSize="14" FontWeight="Bold" Margin="0,0,6,0" Foreground="#FFFFFF" VerticalAlignment="Center"/>
                    <TextBlock Text="Decline" FontWeight="SemiBold" FontSize="13" Foreground="#FFFFFF" VerticalAlignment="Center"/>
                    <TextBlock Text="[Esc]" FontSize="11" Foreground="#CCFFFFFF" Margin="6,2,0,0" VerticalAlignment="Center"/>
                </StackPanel>
            </Border>
        </Grid>

        <Border Grid.Row="5" Padding="10,6" Background="#18FF9800" BorderBrush="#40FF9800" BorderThickness="1" CornerRadius="6">
            <TextBlock Text="BellView Intercom · Microsoft Store Edition · Native Windows 11 Desktop Client" FontSize="11" FontWeight="SemiBold" Foreground="#FFB74D" HorizontalAlignment="Center"/>
        </Border>
    </Grid>
</Border>
"@

$element = [System.Windows.Markup.XamlReader]::Parse($xamlString)
$element.Measure([System.Windows.Size]::new(480, 680))
$element.Arrange([System.Windows.Rect]::new(0, 0, 480, 680))
$element.UpdateLayout()

$rtb = [System.Windows.Media.Imaging.RenderTargetBitmap]::new(480, 680, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
$rtb.Render($element)

$encoder = [System.Windows.Media.Imaging.PngBitmapEncoder]::new()
$encoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($rtb))
$fs = [System.IO.File]::Create($OutputPath)
$encoder.Save($fs)
$fs.Close()
Write-Host "BellView preview rendered to $OutputPath"
