import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";

export class SubtitleSystem {
    private guiTexture: AdvancedDynamicTexture;
    private subtitleText: TextBlock;

    constructor() {
        this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        this.subtitleText = new TextBlock();
        this.subtitleText.text = "";
        this.subtitleText.color = "white";
        this.subtitleText.fontSize = 24;
        this.subtitleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.subtitleText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.subtitleText.paddingBottom = "20px";
        this.subtitleText.alpha = 0; 

        this.guiTexture.addControl(this.subtitleText);
    }

    public showSubtitle(text: string, duration = 3000): void {
        this.subtitleText.text = text;
        this.subtitleText.alpha = 1; 

        setTimeout(() => {
            this.subtitleText.alpha = 0;
        }, duration);
    }
}
