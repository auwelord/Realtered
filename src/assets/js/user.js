let Constants = {
    //  install
    install(Vue, options) {
      //  create global Constants
      Vue.Constants = {
        BUCKET: "s3-custom-images",
        VERSION: 1.5,
        EXT_LINK: "https://link.tld"
      };
    }
  };
  
  export default Constants;