import PogObject from "PogData";
import Settings from "./config";

const data = new PogObject("PowderTracker", {
  chests: 0,
  gemstonePowder: 0,
  mithrilPowder: 0,
  hudPos: [0, 0]
}, ".persistantData.json");

const statDisplay = new Display();
statDisplay.setBackgroundColor(Renderer.color(0, 0, 0, 75));
statDisplay.setBackground("full");

const moveGui = new Gui();

let sessionRunning = false;
let startTime = 0;
let sessionChests = 0;
let sessionGemstone = 0;
let sessionMithril = 0;

register("worldLoad", () => {
  updateDisplay();
});

function printHelp() {
  ChatLib.chat("Available commands");
  ChatLib.chat(" /powdertracker config: Opens the config menu.")
  ChatLib.chat(" /powdertracker help: Shows this help menu.")
  ChatLib.chat(" /powdertracker move: Adjust the HUD position.")
  ChatLib.chat(" /powdertracker start: Starts a new session.");
  ChatLib.chat(" /powdertracker stop: Stops the current session.");
  ChatLib.chat(" /powdertracker sync: Updates the state of the tracker.");
  ChatLib.chat(" /powdertracker reset: Resets all stats.");
}

register("command", (...args) => {
  if (!args || args.length === 0) {
    printHelp();
    return;
  }

  switch(args[0]) {
    case "config":
      Settings.openGUI();
      break;
    case "start":
      if (sessionRunning) {
        ChatLib.chat("Session already running");
        return;
      }
      sessionRunning = true;
      startTime = Date.now();
      sessionChests = 0;
      sessionGemstone = 0;
      sessionMithril = 0;
      ChatLib.chat("Started new powder session");
      updateDisplay();
      break;
    case "stop":
      if (!sessionRunning) {
        ChatLib.chat("No powder session running");
        return;
      }
      sessionRunning = false;
      const [hr, min, sec] = getSessionDuration();
      ChatLib.chat(`Stopped powder session. Active time: ${hr}:${min}:${sec}`);
      updateDisplay();
      break;
    case "sync":
      updateDisplay();
      break;
    case "move":
      moveGui.open();
      break;
    case "reset":
      data.chests = 0;
      data.gemstonePowder = 0;
      data.mithrilPowder = 0;
      updateDisplay();
      break;
    default:
      printHelp();
  }
}).setName("powdertracker");

register("chat", event => {
  data.chests += 1;
  sessionChests += 1;
  updateDisplay();
}).setCriteria("&r&6You have successfully picked the lock on this chest!&r");

register("chat", (value, type, event) => {
  let amount = parseInt(value);
  if (is2xEventActive()) {
    amount *= 2;
  }
  if (type.toLowerCase() === "gemstone") {
    data.gemstonePowder += amount;
    sessionGemstone += amount;
  } else if (type.toLowerCase() === "mithril") {
    data.mithrilPowder += amount;
    sessionMithril += amount;
  } else {
    ChatLib.chat("Error: Unknown powder type " + type);
  }
  updateDisplay();
}).setCriteria("&r&aYou received &r&b+${value} &r&a${type} Powder&r");

function updateDisplay() {
  data.save();
  const [x, y] = data.hudPos;
  statDisplay.clearLines();
  statDisplay.setRenderLoc(x, y);
  statDisplay.setAlign(
    Settings.TrackerAlignment == 0 ? "left" : 
    Settings.TrackerAlignment == 1 ? "right" :
    "center"
  );
  statDisplay.setShouldRender(Settings.TrackerVisible);

  let line = 0;
  const renderText = (text, value) => {
    statDisplay.setLine(line++, `§6${text}: §r${value}`);
  };

  if (Settings.ShowTotals) {
    renderText("Total Chests", data.chests);
    renderText("Total Gemstone", data.gemstonePowder);
    renderText("Total Mithril", data.mithrilPowder);
    if (sessionRunning) {
      line++;
    }
  }

  if (sessionRunning) {
    renderText("Session Chests", sessionChests);
    renderText("Session Gemstone", sessionGemstone);
    renderText("Session Mithril", sessionMithril);
    
    if (Settings.ShowRates) {
      line++;
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      renderText("Chests/hr", Math.round((sessionChests/elapsedSeconds) * 3600));
      renderText("Gemstone/hr", Math.round((sessionGemstone/elapsedSeconds) * 3600));
      renderText("Mithril/hr", Math.round((sessionMithril/elapsedSeconds) * 3600));
    }
  }
}

register("dragged", (dx, dy, x, y) => {
  if (moveGui.isOpen()) {
    data.hudPos = [x, y];
    statDisplay.setRenderLoc(x, y);
    data.save();
  }
});

const overlayText = new Text("Drag to move the PowderTracker")
  .setAlign("center")
  .setScale(4)
  .setShadow(true);
moveGui.registerDraw(() => {
  overlayText.draw(Renderer.screen.getWidth() / 2, Renderer.screen.getHeight() / 2);
});

function getSessionDuration() {
  const millis = Date.now() - startTime;
  let sec = Math.floor(millis / 1000);
  let min = Math.floor(sec / 60);
  let hr = Math.floor(min / 60) % 24;
  sec %= 60;
  min %= 60;
  const pad = num => num.toString().padStart(2, "0");
  return [pad(hr), pad(min), pad(sec)];
}

const bossBar = Java.type("net.minecraft.entity.boss.BossStatus");
function is2xEventActive() {
  const bossBarText = bossBar.field_82827_c; // bossName
  return bossBarText.includes("2X POWDER");
}