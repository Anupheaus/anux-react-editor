import { style, flex, position, shadows } from 'anux-react-styles';

export default {

  editor: style({
    margin: '30px',
    width: '250px',
    padding: '5px',
    backgroundColor: '#eee',
    border: 'solid 1px #aaa',
    ...shadows.box.ambient(2),
    // boxShadow: '0 0 2px 1px #aaaaaa66',
    fontSize: '12pt',
  }),

  reports: {

    container: style({
      ...flex.content.stack,
      ...position.absolute,
      top: '30px',
      left: '310px',
      width: '250px',
    }),

    block: style({
      ...flex.content.stack,
      ...shadows.box.ambient(2),
      backgroundColor: '#eee',
      padding: '5px',
      border: 'solid 1px #aaa',
      // boxShadow: '0 0 2px 1px #aaaaaa66',
      marginBottom: '20px',

      $nest: {
        '&>record-property': {
          ...flex.content,

          $nest: {
            '&>record-property-name': {
              width: '50%',
            },
          },
        },
      },
    }),

  },

};
