import { @Vigilant, @ButtonProperty, @SwitchProperty, @SelectorProperty } from 'Vigilance';

@Vigilant("PowderTracker")
class Settings {
  @SwitchProperty({
    name: "Show overlay",
    description: "If the tracker overlay should be visible.",
    category: "General"
  })
  TrackerVisible = true;

  @SwitchProperty({
    name: "Show totals",
    description: "If the tracker should show the total amount.",
    category: "General"
  })
  ShowTotals = true;

  @SwitchProperty({
    name: "Show rates",
    description: "If the tracker should show the estimated rates per hour.",
    category: "General"
  })
  ShowRates = true;

  @SelectorProperty({
    name: "Alignment",
    description: "Sets the alignment of the tracker.",
    category: "General",
    options: ["Left", "Right", "Center"]
  })
  TrackerAlignment = 0;

  @ButtonProperty({
    name: "Change tracker position",
    description: "Move the location of the tracker.",
    category: "General",
    placeholder: "Open"
  })
  moveLocation() {
    ChatLib.command("powdertracker move", true);
  }

  @ButtonProperty({
    name: "Start session",
    description: "Starts a new powder session.",
    category: "General",
    placeholder: "Start"
  })
  startSession() {
    ChatLib.command("powdertracker start", true);
  }

  @ButtonProperty({
    name: "Stop session",
    description: "Stops the current powder session.",
    category: "General",
    placeholder: "Stop"
  })
  stopSession() {
    ChatLib.command("powdertracker stop", true);
  }

  constructor() {
    this.initialize(this);
    this.registerListener("Show overlay", value => {
      this.TrackerVisible = value;
      ChatLib.command("powdertracker sync", true);
    });
    this.registerListener("Show totals", value => {
      this.ShowTotals = value;
      ChatLib.command("powdertracker sync", true);
    });
    this.registerListener("Show rates", value => {
      this.ShowRates = value;
      ChatLib.command("powdertracker sync", true);
    });
    this.registerListener("Alignment", value => {
      this.TrackerAlignment = value;
      ChatLib.command("powdertracker sync", true);
    });
  }
}

export default new Settings();