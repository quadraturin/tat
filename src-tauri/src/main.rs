// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;

fn main() {

  tauri::Builder::default()
  .invoke_handler(tauri::generate_handler![get_language_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

// Makes this accessible to javascript
#[tauri::command]
fn get_language_file() -> String {
  fs::read_to_string("lang/en-us.json")
  .expect("couldn't find the language file!")
}