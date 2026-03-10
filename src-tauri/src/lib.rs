#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri::AppHandle;

#[tauri::command]
async fn play_notification_sound(app_handle: AppHandle) {
    let sound_path = get_resource_path("notification.wav");

    if let Some(sound_path) = sound_path {
        if sound_path.exists() {
            std::thread::spawn(move || {
                if let Ok(file) = std::fs::File::open(&sound_path) {
                    if let Ok((_stream, handle)) = rodio::OutputStream::try_default() {
                        if let Ok(sink) = rodio::Sink::try_new(&handle) {
                            if let Ok(source) = rodio::Decoder::new(std::io::BufReader::new(file)) {
                                sink.append(source);
                                sink.sleep_until_end();
                            }
                        }
                    }
                }
            });
        } else {
            eprintln!("Sound file not found at: {:?}", sound_path);
        }
    } else {
        eprintln!("Failed to determine resource directory");
    }
}

/// 获取资源文件的绝对路径（兼容 Tauri 2.0 打包）
fn get_resource_path(resource: &str) -> Option<std::path::PathBuf> {
    #[cfg(target_os = "macos")]
    {
        // On macOS, resources are in App.app/Contents/Resources/
        std::env::current_exe().ok().and_then(|exe| {
            exe.parent()
                .map(|p| p.parent().unwrap().join("Resources").join(resource))
        })
    }
    #[cfg(not(target_os = "macos"))]
    {
        // Windows / Linux: resources next to executable
        std::env::current_exe()
            .ok()
            .and_then(|exe| exe.parent().map(|p| p.join("resources").join(resource)))
    }
}

pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![play_notification_sound])
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_os::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
