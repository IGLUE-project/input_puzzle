//Copy this file to config.js and specify your own settings

export let ESCAPP_APP_SETTINGS = {
  //Settings that can be specified by the authors
  //backgroundImg: "", //background can be "NONE" or a URL.
  //message: "Enter the solution",
  //buttonLabel: "Send",
  //placeholder: "Custom placeholder",
  //width: "90",
  //fontSize: "5",  //in vmin
  //fontSizeMin: "16",  //in px
  //fontSizeMax: "100", //in px
  //fontColor: "#ffffffff",
  //fontColorErrorMessage: "rgb(235, 56, 56);",
  //fontColorSuccessMessage: "rgb(73, 189, 25);",
  //xposition: "RIGHT", //This value can be "LEFT", "CENTER" or "RIGHT"
  //yposition: "BOTTOM", //This value can be "TOP", "CENTER" or "BOTTOM"
  //opacity: "100", // from 0 to 100
  //delay: "3", //in seconds

  //Settings that will be automatically specified by the Escapp server
  locale: "es",

  escappClientSettings: {
    endpoint: "https://escapp.es/api/escapeRooms/id",
    linkedPuzzleIds: [1],
    rtc: false,
  },
};