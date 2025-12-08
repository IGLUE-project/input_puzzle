import { useContext, useEffect, useRef, useState } from "react";
import "./../assets/scss/MainScreen.scss";
import { GlobalContext } from "./GlobalContext";
import { XPOSITION, YPOSITION } from "../constants/constants";

export default function MainScreen({ config, sendInput, result }) {
  const { I18n } = useContext(GlobalContext);
  const inputRef = useRef(null);
  const [xposition, setXposition] = useState("CENTER");
  const [yposition, setYposition] = useState("CENTER");
  useEffect(() => {
    const input = inputRef.current;
    if (!input || !config.autoWidthBoolean) return;

    const handleInput = () => {
      const length = Math.max(input.value.length, config.placeholder.length);
      input.style.width = `${length}ch`;
    };

    handleInput();
    input.addEventListener("input", handleInput);

    return () => input.removeEventListener("input", handleInput);
  }, [config]);

  const handleSend = () => {
    const value = inputRef.current?.value;
    if (value) {
      sendInput(value);
      inputRef.current.value = "";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };
  useEffect(() => {
    switch (config.xposition) {
      case XPOSITION.LEFT:
        setXposition("flex-start");
        break;
      case XPOSITION.CENTER:
        setXposition("center");
        break;
      case XPOSITION.RIGHT:
        setXposition("flex-end");
        break;
    }
    switch (config.yposition) {
      case YPOSITION.TOP:
        setYposition("flex-start");
        break;
      case YPOSITION.CENTER:
        setYposition("center");
        break;
      case YPOSITION.BOTTOM:
        setYposition("flex-end");
        break;
    }
  }, [config]);

  let solved = false;
  let resultMessageExtraClass = "";
  let resultMessageColor = config.fontColor;
  let messageToShow = undefined;
  if (result) {
    if (typeof result.success === "boolean") {
      if (typeof result.message === "string" && result.message.trim() !== "") {
        messageToShow = result.message;
      } else {
        if (result.success === true) {
          messageToShow = I18n.getTrans("i.successMessage");
        } else {
          messageToShow = I18n.getTrans("i.errorMessage");
        }
      }
      if (result.success === true) {
        solved = true;
        resultMessageExtraClass = "successMessage";
        resultMessageColor = config.fontColorSuccessMessage;
      } else {
        resultMessageExtraClass = "errorMessage";
        resultMessageColor = config.fontColorErrorMessage;
      }
    }
  }
  return (
    <div
      id="MainScreen"
      className="screen_wrapper"
      style={{
        color: config.fontColor,
        justifyContent: xposition,
        alignItems: yposition,
        opacity: config.opacityNumber,
      }}
    >
      <div
        className="content"
        style={{
          width: config.autoWidthBoolean ? "auto" : `${config.width}%`,
          minWidth: "375px",
          backgroundColor: config.backgroundColorPanel,
          borderStyle: config.borderStylePanel,
          borderWidth: `${config.borderWidthPanelNumber}px`,
          borderColor: config.borderColorPanel,
        }}
      >
        <p
          className="info"
          style={{
            fontSize: config.fontSizeProp,
            color: config.fontColor,
          }}
        >
          {config.message}
        </p>
        <div className="input-container">
          <input
            ref={inputRef}
            className="input"
            name="text"
            type="text"
            onKeyDown={handleKeyDown}
            style={{
              color: config.fontColor,
              fontSize: config.fontSizeProp,
              width: config.autoWidthBoolean ? "auto" : `100%`,
            }}
            disabled={solved}
            placeholder={solved ? "" : config.placeholder}
          />
          <button
            onClick={handleSend}
            style={{ color: config.fontColor, fontSize: config.fontSizeProp }}
            disabled={solved}
          >
            {config.buttonLabel}
          </button>
        </div>
        <p
          className={`resultMessage ${resultMessageExtraClass}`}
          style={{
            fontSize: config.fontSizeProp,
            color: resultMessageColor,
          }}
        >
          {typeof messageToShow === "string" ? messageToShow : ""}
        </p>
      </div>
    </div>
  );
}