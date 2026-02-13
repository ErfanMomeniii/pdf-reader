use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::{Manager, Emitter};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            let handle = app.handle();

            // App menu (macOS only)
            #[cfg(target_os = "macos")]
            let app_menu = {
                let about = PredefinedMenuItem::about(handle, Some("About PDF Reader"), None)?;
                let preferences = MenuItem::with_id(handle, "preferences", "Preferences...", true, Some("CmdOrCtrl+,"))?;
                let quit = PredefinedMenuItem::quit(handle, Some("Quit PDF Reader"))?;

                Submenu::with_items(
                    handle,
                    "PDF Reader",
                    true,
                    &[
                        &about,
                        &PredefinedMenuItem::separator(handle)?,
                        &preferences,
                        &PredefinedMenuItem::separator(handle)?,
                        &PredefinedMenuItem::services(handle, None)?,
                        &PredefinedMenuItem::separator(handle)?,
                        &PredefinedMenuItem::hide(handle, None)?,
                        &PredefinedMenuItem::hide_others(handle, None)?,
                        &PredefinedMenuItem::show_all(handle, None)?,
                        &PredefinedMenuItem::separator(handle)?,
                        &quit,
                    ],
                )?
            };

            // File menu
            let open_item = MenuItem::with_id(handle, "open", "Open...", true, Some("CmdOrCtrl+O"))?;
            let close_item = MenuItem::with_id(handle, "close", "Close", true, Some("CmdOrCtrl+W"))?;

            #[cfg(not(target_os = "macos"))]
            let quit_item = PredefinedMenuItem::quit(handle, Some("Exit"))?;

            let file_menu = Submenu::with_items(
                handle,
                "File",
                true,
                &[
                    &open_item,
                    &PredefinedMenuItem::separator(handle)?,
                    &close_item,
                    #[cfg(not(target_os = "macos"))]
                    &PredefinedMenuItem::separator(handle)?,
                    #[cfg(not(target_os = "macos"))]
                    &quit_item,
                ],
            )?;

            // View menu
            let zoom_in = MenuItem::with_id(handle, "zoom_in", "Zoom In", true, Some("CmdOrCtrl+Plus"))?;
            let zoom_out = MenuItem::with_id(handle, "zoom_out", "Zoom Out", true, Some("CmdOrCtrl+Minus"))?;
            let actual_size = MenuItem::with_id(handle, "actual_size", "Actual Size", true, Some("CmdOrCtrl+0"))?;

            // Page navigation
            let next_page = MenuItem::with_id(handle, "next_page", "Next Page", true, Some("CmdOrCtrl+]"))?;
            let prev_page = MenuItem::with_id(handle, "prev_page", "Previous Page", true, Some("CmdOrCtrl+["))?;

            let view_menu = Submenu::with_items(
                handle,
                "View",
                true,
                &[
                    &zoom_in,
                    &zoom_out,
                    &PredefinedMenuItem::separator(handle)?,
                    &actual_size,
                    &PredefinedMenuItem::separator(handle)?,
                    &next_page,
                    &prev_page,
                ],
            )?;

            // Help menu (Windows/Linux)
            #[cfg(not(target_os = "macos"))]
            let help_menu = {
                let about = MenuItem::with_id(handle, "about", "About PDF Reader", true, None)?;
                Submenu::with_items(handle, "Help", true, &[&about])?
            };

            let menu = Menu::with_items(
                handle,
                &[
                    #[cfg(target_os = "macos")]
                    &app_menu,
                    &file_menu,
                    &view_menu,
                    #[cfg(not(target_os = "macos"))]
                    &help_menu,
                ],
            )?;

            app.set_menu(menu)?;

            Ok(())
        })
        .on_menu_event(|app, event| {
            let id = event.id().as_ref();
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.emit("menu-event", id);
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
