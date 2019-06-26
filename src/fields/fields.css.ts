import { style, flex } from 'anux-react-styles';

export default {

  common: style({
    padding: '0 0 2px',

    $nest: {
      '&>div': {
        ...flex.full,
      },

      '.MuiInputBase-root': {
        fontSize: 'inherit',
      },

      '.MuiSelect-selectMenu': {
        padding: 0,
        height: 'auto',
      },

      '.MuiInputBase-input': {
        height: '1.6em',
      },

    },
  }),

  progress: style({
    margin: '-1px 0 0',
    padding: '1px 0 0',
    height: '1px',
  }),

};

// export default styles;
