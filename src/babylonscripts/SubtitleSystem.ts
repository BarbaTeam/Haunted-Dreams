import { AdvancedDynamicTexture, Control, TextBlock } from "@babylonjs/gui";
import { Ship } from "./Ship";

export class SubtitleSystem {
    private guiTexture: AdvancedDynamicTexture;
    private subtitleText: TextBlock;
    private queue: { text: string; duration: number }[] = [];
    private isDisplaying = false;

    constructor(private subtitlesEnabled: boolean) {
        this.guiTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        this.subtitleText = new TextBlock();
        this.subtitleText.text = "";
        this.subtitleText.color = "white";
        this.subtitleText.fontFamily = "Courier New"
        this.subtitleText.fontSize = 24;
        this.subtitleText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.subtitleText.textVerticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.subtitleText.paddingBottom = "20px";
        this.subtitleText.alpha = 0;

        this.guiTexture.addControl(this.subtitleText);
    }

    public showSubtitles(subtitles: { text: string; duration: number }[]): void {
        if(!this.subtitlesEnabled) return;
        this.queue.push(...subtitles);
        if (!this.isDisplaying) {
            this.displayNextSubtitle();
        }
    }

    private displayNextSubtitle(): void {
        if (this.queue.length === 0) {
            this.isDisplaying = false;
            return;
        }

        this.isDisplaying = true;
        const { text, duration } = this.queue.shift()!;

        this.subtitleText.text = text;
        this.subtitleText.alpha = 1;

        setTimeout(() => {
            this.subtitleText.alpha = 0;
            this.displayNextSubtitle();
        }, duration);
    }
}


