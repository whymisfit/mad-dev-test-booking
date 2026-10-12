import boundaries from 'eslint-plugin-boundaries';

export const eslintBoundariesConfig = {
  plugins: {
    boundaries,
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
    'boundaries/elements': [
      {
        type: 'app',
        pattern: './src/app',
      },
      {
        type: 'layouts',
        pattern: './src/layouts/*',
      },
      {
        type: 'views',
        pattern: './src/views/*',
      },
      {
        type: 'widgets',
        pattern: './src/widgets/*',
      },
      {
        type: 'features',
        pattern: './src/features/*',
      },
      {
        type: 'entities',
        pattern: './src/entities/*',
      },
      {
        type: 'shared',
        pattern: './src/shared',
      },
    ],
  },
  rules: {
    'boundaries/element-types': [
      2,
      {
        default: 'allow',
        rules: [
          // Import order: shared -> entities -> features -> widgets -> views -> layouts -> app
          {
            from: 'shared',
            disallow: ['app', 'features', 'widgets', 'entities', 'layouts', 'views'],
            message:
              'Module from lower layer (${file.type}) cannot import module from upper layer (${dependency.type})',
          },
          {
            from: 'entities',
            disallow: ['app', 'features', 'widgets', 'layouts', 'views'],
            message:
              'Module from lower layer (${file.type}) cannot import module from upper layer (${dependency.type})',
          },
          {
            from: 'features',
            disallow: ['app', 'widgets', 'layouts', 'views'],
            message:
              'Module from lower layer (${file.type}) cannot import module from upper layer (${dependency.type})',
          },
          {
            from: 'widgets',
            disallow: ['app', 'layouts', 'views'],
            message:
              'Module from lower layer (${file.type}) cannot import module from upper layer (${dependency.type})',
          },
          {
            from: 'views',
            disallow: ['app', 'layouts'],
            message:
              'Module from lower layer (${file.type}) cannot import module from upper layer (${dependency.type})',
          },
          {
            from: 'layouts',
            disallow: ['app'],
            message:
              'Module from lower layer (${file.type}) cannot import module from upper layer (${dependency.type})',
          },
          {
            from: 'layouts',
            disallow: ['layouts'],
            message: 'Cross-module dependencies are not allowed in the layouts layer',
          },
          {
            from: 'views',
            disallow: ['views'],
            message: 'Cross-module dependencies are not allowed in the views layer',
          },
          {
            from: 'widgets',
            disallow: ['widgets'],
            message: 'Cross-module dependencies are not allowed in the widgets layer',
          },
          {
            from: 'features',
            disallow: ['features'],
            message: 'Cross-module dependencies are not allowed in the features layer',
          },
          // This line is commented because we are allowed to use cross-module dependencies in entities
          // {
          //   from: 'entities',
          //   disallow: ['entities'],
          //   message: 'Cross-module dependencies are not allowed in the entities layer',
          // },
        ],
      },
    ],
    'boundaries/entry-point': [
      2,
      {
        default: 'disallow',
        message:
          'Module (${file.type}) must be imported through public API. Direct import from ${dependency.source} is not allowed',

        rules: [
          {
            target: ['shared', 'app'],
            allow: '**',
          },
          {
            target: ['entities', 'features', 'widgets', 'views', 'layouts', 'app'],
            allow: [
              'ui/index.(ts|tsx)',
              'lib/index.(ts|tsx)',
              'model/index.(ts|tsx)',
              'actions/index.(ts|tsx)',
              'api/index.(ts|tsx)',
            ],
          },
        ],
      },
    ],
  },
};
