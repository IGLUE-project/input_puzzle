import { useContext, useEffect, useRef, useState } from "react";
import "./../assets/scss/app.scss";

import { DEFAULT_APP_SETTINGS, ESCAPP_CLIENT_SETTINGS } from "../constants/constants.jsx";
import { GlobalContext } from "./GlobalContext.jsx";
import MainScreen from "./MainScreen.jsx";

export default function App() {
  const { escapp, setEscapp, appSettings, setAppSettings, Storage, setStorage, Utils, I18n } =
    useContext(GlobalContext);
  const hasExecutedEscappValidation = useRef(false);

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({ success: undefined, message: undefined });

  useEffect(() => {
    //Init Escapp client
    if (escapp !== null) {
      return;
    }
    //Create the Escapp client instance.
    let _escapp = new ESCAPP(ESCAPP_CLIENT_SETTINGS);
    setEscapp(_escapp);
    Utils.log("Escapp client initiated with settings:", _escapp.getSettings());

    //Use the storage feature provided by Escapp client.
    setStorage(_escapp.getStorage());

    //Get app settings provided by the Escapp server.
    let _appSettings = processAppSettings(_escapp.getAppSettings());
    setAppSettings(_appSettings);
  }, []);

  useEffect(() => {
    if (!hasExecutedEscappValidation.current && escapp !== null && appSettings !== null && Storage !== null) {
      hasExecutedEscappValidation.current = true;

      //Register callbacks in Escapp client and validate user.
      escapp.registerCallback("onNewErStateCallback", function (erState) {
        try {
          Utils.log("New escape room state received from ESCAPP", erState);
          restoreAppState(erState);
        } catch (e) {
          Utils.log("Error in onNewErStateCallback", e);
        }
      });

      escapp.registerCallback("onErRestartCallback", function (erState) {
        try {
          Utils.log("Escape Room has been restarted.", erState);
          if (typeof Storage !== "undefined") {
            Storage.removeSetting("state");
          }
        } catch (e) {
          Utils.log("Error in onErRestartCallback", e);
        }
      });

      //Validate user. To be valid, a user must be authenticated and a participant of the escape room.
      escapp.validate((success, erState) => {
        try {
          Utils.log("ESCAPP validation", success, erState);
          if (success) {
            restoreAppState(erState);
            setLoading(false);
          }
        } catch (e) {
          Utils.log("Error in validate callback", e);
        }
      });
    }
  }, [escapp, appSettings, Storage]);

  function restoreAppState(erState) {
    Utils.log("Restore application state based on escape room state:", erState);
  }

  function processAppSettings(_appSettings) {
    if (typeof _appSettings !== "object") {
      _appSettings = {};
    }
    if (typeof _appSettings.skin === "undefined" && typeof DEFAULT_APP_SETTINGS.skin === "string") {
      _appSettings.skin = DEFAULT_APP_SETTINGS.skin;
    }

    if (typeof _appSettings.backgroundColorPanel != "undefined"){
      if (typeof _appSettings.backgroundColorPanel != "string" || _appSettings.backgroundColorPanel.trim() === "") {
        delete _appSettings.backgroundColorPanel;
      }
    }

    // Merge _appSettings with DEFAULT_APP_SETTINGS_SKIN to obtain final app settings
    _appSettings = Utils.deepMerge(DEFAULT_APP_SETTINGS, _appSettings);

    //Init internacionalization module
    I18n.init(_appSettings);

    if (typeof _appSettings.delay === "number") {
      _appSettings.delayNumber = _appSettings.delay;
    } else {
      _appSettings.delayNumber = parseFloat(_appSettings.delay);
    }
    _appSettings.delayNumber = 1000*_appSettings.delayNumber; //Convert delay to ms

    if (typeof _appSettings.opacity === "number") {
      _appSettings.opacityNumber = _appSettings.opacity;
    } else {
      _appSettings.opacityNumber = parseInt(_appSettings.opacity);
    }
    _appSettings.opacityNumber = _appSettings.opacityNumber/100;

    //Font size
    if (typeof _appSettings.fontSize === "number") {
      _appSettings.fontSizeNumber = _appSettings.fontSize;
    } else {
      _appSettings.fontSizeNumber = parseInt(_appSettings.fontSize);
    }
    if (typeof _appSettings.fontSizeMin === "number") {
      _appSettings.fontSizeMinNumber = _appSettings.fontSizeMin;
    } else {
      _appSettings.fontSizeMinNumber = parseInt(_appSettings.fontSizeMin);
    }
    if (typeof _appSettings.fontSizeMax === "number") {
      _appSettings.fontSizeMaxNumber = _appSettings.fontSizeMax;
    } else {
      _appSettings.fontSizeMaxNumber = parseInt(_appSettings.fontSizeMax);
    }
    _appSettings.fontSizeProp = `clamp(${_appSettings.fontSizeMinNumber}px, ${_appSettings.fontSize}vmin, ${_appSettings.fontSizeMaxNumber}px)`;

    if (typeof _appSettings.autoWidth === "boolean") {
      _appSettings.autoWidthBoolean = _appSettings.autoWidth;
    } else {
      _appSettings.autoWidthBoolean = _appSettings.autoWidth === "true";
    }

    if ((typeof _appSettings.message !== "string")||(_appSettings.message.trim()==="")) {
      _appSettings.message = I18n.getTrans("i.message");
    }

    if ((typeof _appSettings.buttonLabel !== "string")||(_appSettings.buttonLabel.trim()==="")) {
      _appSettings.buttonLabel = I18n.getTrans("i.send");
    }

    if (typeof _appSettings.backgroundImg === "string" && _appSettings.backgroundImg.trim() !== "" && _appSettings.backgroundImg !== "NONE") {
      _appSettings.background = "url(" + _appSettings.backgroundImg + ") no-repeat";
      _appSettings.backgroundSize = "100% 100%";
    }

    if (typeof _appSettings.borderWidthPanel == "number") {
      _appSettings.borderWidthPanelNumber = _appSettings.borderWidthPanel;
    } else {
      _appSettings.borderWidthPanelNumber = parseInt(_appSettings.borderWidthPanel);
    }

    if ((Number.isNaN(_appSettings.borderWidthPanelNumber))||(_appSettings.borderWidthPanelNumber <= 0)) {
      _appSettings.borderStylePanel = "none";
    } else {
      _appSettings.borderStylePanel = "solid";
    }

    //Change HTTP protocol to HTTPs in URLs if necessary
    _appSettings = Utils.checkUrlProtocols(_appSettings);

    //Preload resources (if necessary)
    Utils.preloadImages([_appSettings.backgroundMessage]);
    //Utils.preloadAudios([_appSettings.soundBeep,_appSettings.soundNok,_appSettings.soundOk]); //Preload done through HTML audio tags
    //Utils.preloadVideos(["videos/some_video.mp4"]);
    Utils.log("App settings:", _appSettings);
    return _appSettings;
  }

  function checkResult(_solution) {
    escapp.checkNextPuzzle(_solution, {}, (success, erState) => {
      Utils.log("Check solution Escapp response", success, erState);
      if (success) {
        try {
          setResult({ success: true, message: erState.msg });
          setTimeout(() => {
            submitPuzzleSolution(_solution);
          }, appSettings.delayNumber);
        } catch (e) {
          Utils.log("Error in checkNextPuzzle", e);
        }
      } else {
        setResult({ success: false, message: erState.msg });
      }
    });
  }
  function submitPuzzleSolution(_solution) {
    Utils.log("Submit puzzle solution", _solution);

    escapp.submitNextPuzzle(_solution, {}, (success, erState) => {
      Utils.log("Solution submitted to Escapp", _solution, success, erState);
    });
  }

  return (
    <div
      id="global_wrapper"
      className={`${
        appSettings !== null && typeof appSettings.skin === "string" ? appSettings.skin.toLowerCase() : ""
      }`}
      {...(appSettings !== null &&
      typeof appSettings.background === "string" &&
      typeof appSettings.backgroundSize === "string"
        ? {
            style: {
              background: appSettings.background,
              backgroundSize: appSettings.backgroundSize,
            },
          }
        : {})}
    >
      <div className={`main-background ${result && result.success === true ? "solved" : ""}`}>
        {!loading && <MainScreen config={appSettings} sendInput={checkResult} result={result} />}
      </div>
    </div>
  );
}
