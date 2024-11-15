/**
 * @callback onLoaded
 * @returns {void}
 */

/**
 * @callback onError
 * @returns {void}
 */

/**
 * @callback onSuccess
 * @param {string} token
 * @returns {void}
 */

/**
 * Allows to inject an Arkose Labs captcha into the DOM.
 * @class
 */
export class ArkoseCaptchaIntegration {
    #publicKey;
    #data;
  
    /** @type {HTMLScriptElement} */
    #setupEnforcementScript;
    /** @type {HTMLScriptElement} */
    #apiScript;
  
    /**
     * Creates an instance of ArkoseCaptchaIntegration.
     * @constructor
     * @param {string} publicKey - The provider publicKey following this pattern XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     * @param {string} data - The captcha associated blob data
     */
    constructor(publicKey, data) {
      this.#publicKey = publicKey;
      this.#data = data;
    }
  
    #isChallengeEvent(data) {
      return !!data && typeof data === "object" && "eventId" in data;
    }
  
    #handleEvent(e) {
      if (typeof e.data === "string") {
        const eventData = JSON.parse(e.data);
        if (this.#isChallengeEvent(eventData)) {
          switch (eventData.eventId) {
            case "challenge-loaded":
              this.onLoaded?.();
              break;
            case "challenge-complete":
              this.onSuccess?.(eventData.payload.sessionToken);
              break;
            case "challenge-error":
            case "challenge-failed":
              this.onError?.();
              break;
          }
        }
      }
    }
  
    /**
     * Loads the captcha logic and starts events listeners.
     * @param {string} htmlContainerId - The HTMLElement ID in which the captcha should be injected.
     * @throws {Error} When HTML container is not found.
     */
    load(htmlContainerId) {
      const htmlContainer = document.getElementById(htmlContainerId);
      if (!htmlContainer) throw new Error(`The HTML container with ID ${htmlContainerId} was not found !`);
  
      window.addEventListener("message", this.#handleEvent.bind(this));
  
      // Inject Arkose Labs enforcement script
      this.#setupEnforcementScript = document.createElement("script");
      this.#setupEnforcementScript.textContent = makeEnforcementScript({
        targetElementId: htmlContainerId,
        publicKey: this.#publicKey,
        data: this.#data,
        startTime: Date.now(),
      });
      document.head.appendChild(this.#setupEnforcementScript);
  
      // Load Arkose Labs game script
      this.#apiScript = document.createElement("script");
      this.#apiScript.src = `//client-api.arkoselabs.com/v2/${this.#publicKey}/api.js`;
      this.#apiScript.dataset["callback"] = "setupEnforcement";
      this.#apiScript.defer = true;
      this.#apiScript.async = true;
      document.head.appendChild(this.#apiScript);
    }
  
    /**
     * Clears the event listener and the scripts that have been injected.
     */
    unload() {
      window.removeEventListener("message", this.#handleEvent);
      this.#setupEnforcementScript?.remove();
      this.#apiScript?.remove();
    }
  
    /**
     * Handles the time when the captcha is correctly loaded into the DOM.
     * @type {onLoaded=}
     */
    onLoaded;
  
    /**
     * Handles the captcha success with the token to be returned to the demanding service.
     * @type {onSuccess=}
     */
    onSuccess;
  
    /**
     * Handles any captcha resolution failure.
     * @type {onError=}
     */
    onError;
  }
  
  /**
   * Generate the Arkose Labs enforcement script.
   * @param {Object} options
   * @param {string} options.publicKey
   * @param {string} options.targetElementId
   * @param {string} options.data
   * @param {number} options.startTime
   * @returns {string}
   */
  const makeEnforcementScript = ({ data, publicKey, startTime, targetElementId }) => {
    return `
    function setupEnforcement(e) {
        const endTime = Date.now();
  
        e.setConfig({
          selector: "#${targetElementId}",
          styleTheme: undefined,
          language: "en",
          data: { blob: "${data}" },
          mode: "inline",
          noSuppress: undefined,
          apiLoadTime: { start: ${startTime}, end: endTime, diff: endTime - ${startTime} },
          onCompleted: function (e) {
            parent.postMessage(
              JSON.stringify({ eventId: "challenge-complete", publicKey: "${publicKey}", payload: { sessionToken: e.token } }),
              "*"
            );
          },
          onReady: function (e) {
            parent.postMessage(
              JSON.stringify({ eventId: "challenge-loaded", publicKey: "${publicKey}", payload: { sessionToken: e.token } }),
              "*"
            );
          },
          onSuppress: function (e) {
            parent.postMessage(
              JSON.stringify({ eventId: "challenge-suppressed", publicKey: "${publicKey}", payload: { sessionToken: e.token } }),
              "*"
            );
          },
          onShown: function (e) {
            parent.postMessage(
              JSON.stringify({ eventId: "challenge-shown", publicKey: "${publicKey}", payload: { sessionToken: e.token } }),
              "*"
            );
          },
          onError: function (e) {
            parent.postMessage(
              JSON.stringify({ eventId: "challenge-error", publicKey: "${publicKey}", payload: { error: e.error } }),
              "*"
            );
          },
          onWarning: function (e) {
            parent.postMessage(
              JSON.stringify({ eventId: "challenge-warning", publicKey: "${publicKey}", payload: { warning: e.warning } }),
              "*"
            );
          },
          onFailed: function (e) {
            parent.postMessage(
              JSON.stringify({ eventId: "challenge-failed", publicKey: "${publicKey}", payload: { sessionToken: e.token } }),
              "*"
            );
          },
          onResize: function (e) {
            var n = e && e.height ? e.height : 450,
              a = e && e.width ? e.width : 400;
            try {
              "string" == typeof n && ((n = n.replace("px", "")), (n = parseInt(n, 10)), isNaN(n) && (n = 450)),
                "string" == typeof a && ((a = a.replace("px", "")), (a = parseInt(a, 10)), isNaN(a) && (a = 400));
            } catch (e) {
              (n = 450), (a = 400);
            }
            parent.postMessage(
              JSON.stringify({ eventId: "challenge-iframeSize", publicKey: "${publicKey}", payload: { frameHeight: n, frameWidth: a } }),
              "*"
            );
          },
        });
    }`;
  };
  