import { Menu, MenuItem, PredefinedMenuItem, Submenu } from '@tauri-apps/api/menu';
import { tryQuit } from './util.quit';
import { openAboutMenu, openSettingsMenu } from './ui.menus';
import { readFiles } from './media.readFiles';
import { saveProject } from './project.saveProject';
import { loadProject } from './project.loadProject';
import { clearProject } from './project.clearProject';


export async function setWindowMenu() {
    const aboutSubmenu = await Submenu.new({
        text: 'About',
        items: [
            await MenuItem.new({
                id: 'about',
                text: 'About',
                action: () => {
                    openAboutMenu();
                },
            }),
            await MenuItem.new({
                id: 'settings',
                text: 'Settings',
                action: () => {
                    openSettingsMenu();
                },
            }),
            await PredefinedMenuItem.new({
                text: 'separator-text',
                item: 'Separator',
            }),
            await MenuItem.new({
                id: 'quit',
                text: 'Quit',
                action: () => {
                    tryQuit();
                },
            }),
        ],
    });

    const fileSubmenu = await Submenu.new({
        text: 'File',
        items: [
            await MenuItem.new({
                id: 'add',
                text: 'Add Media',
                action: () => {
                    readFiles();
                },
            }),
            await PredefinedMenuItem.new({
                text: 'separator-text',
                item: 'Separator',
            }),
            await MenuItem.new({
                id: 'save',
                text: 'Save Project',
                action: () => {
                    saveProject(false);
                },
            }),
            await MenuItem.new({
                id: 'save_as',
                text: 'Save Project As...',
                action: () => {
                    saveProject(true);
                },
            }),
            await PredefinedMenuItem.new({
                text: 'separator-text',
                item: 'Separator',
            }),
            await MenuItem.new({
                id: 'open',
                text: 'Open Project...',
                action: () => {
                    loadProject();
                },
            }),
            await MenuItem.new({
                id: 'new',
                text: 'New Project',
                action: () => {
                    clearProject();
                },
            }),
        ],
    });
    const menu = await Menu.new({
        items: [aboutSubmenu, fileSubmenu],
    });

    menu.setAsAppMenu();
}