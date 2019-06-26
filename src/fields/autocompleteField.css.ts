import { style } from 'anux-react-styles';

export default {
  popupMenu: style({
    $nest: {
      '&>div>ul': {
        margin: 0,
        padding: '8px 0',
        listStyleType: 'none',

        $nest: {
          '&>li': {
            display: 'block',
          },
        },
      },
    },
  }),
};
