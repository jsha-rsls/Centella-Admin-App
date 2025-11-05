const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: './src/assets/icons/icon',
    name: 'Centella Homes HOA Management',
    executableName: 'centella-hoa',
    appBundleId: 'com.centella.hoa',
    appCategoryType: 'public.app-category.business',
    win32metadata: {
      CompanyName: 'Centella Homes',
      FileDescription: 'HOA Management System',
      ProductName: 'Centella Homes HOA',
      OriginalFilename: 'centella-hoa.exe'
    },
    darwinDarkModeSupport: true,
    extraResource: [
      './src/assets'
    ],
    // Remove the ignore property - let Electron Forge Vite plugin handle it automatically
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'centella_hoa',
        authors: 'Centella Homes',
        description: 'HOA Management System',
        setupIcon: './src/assets/icons/icon.ico',
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Centella Homes',
          homepage: 'https://centellahomes.com',
          icon: './src/assets/icons/icon.png'
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: 'Centella Homes',
          homepage: 'https://centellahomes.com',
          icon: './src/assets/icons/icon.png'
        }
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'src/main.js',
            config: 'vite.main.config.mjs',
            target: 'main',
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.mjs',
            target: 'preload',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs',
          },
        ],
      },
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};