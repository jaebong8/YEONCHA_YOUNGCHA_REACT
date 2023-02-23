import { Global } from "@emotion/react";

const Fonts = () => (
    <Global
        styles={`
    @font-face {
        font-family: "Roboto";
        font-style: normal;
        font-weight: 400;
        src: local("Roboto"), url("../assets/fonts/Roboto-Regular.woff2") format("font-woff2");
        font-display: swap;
    }
    
    @font-face {
        font-family: "Roboto";
        font-style: bold;
        font-weight: 700;
        src: local("Roboto"), url("../assets/fonts/Roboto-Bold.woff2") format("font-woff2");
        font-display: swap;
    }
    
    @font-face {
        font-family: "Noto Sans KR";
        font-style: normal;
        font-weight: 400;
        src: local("NotoSansKR"), url("../assets/fonts/NotoSansKR-Regular.woff2") format("font-woff2");
        font-display: swap;
    }
    
    @font-face {
        font-family: "Noto Sans KR";
        font-style: bold;
        font-weight: 700;
        src: local("NotoSansKR"), url("../assets/fonts/NotoSansKR-Bold.woff2") format("font-woff2");
        font-display: swap;
    }
      `}
    />
);

export default Fonts;
