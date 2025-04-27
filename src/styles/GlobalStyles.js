import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  body {
    /* Zakážeme kontextové menu */
    &::-webkit-context-menu {
      display: none;
    }
  }

  /* Zakážeme kontextové menu pro všechny elementy */
  * {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    
    &::selection {
      background: transparent;
    }
    
    &::-moz-selection {
      background: transparent;
    }
  }
`;

export default GlobalStyles; 