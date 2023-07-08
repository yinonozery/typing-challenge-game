import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const TIME_WEIGHT = 0.5; // Weight assigned to the timer
const LENGTH_WEIGHT = 0.5; // Weight assigned to the input length
const MAX_TIMER = 3 * 60; // Max time to wait in seconds

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  @ViewChild('userInput', { static: false }) textInput!: ElementRef<HTMLInputElement>;

  score: number = 0;
  randomText = '';
  textEntered = '';
  timer: number = 0;
  timerPaused: boolean = true;
  cheated: boolean = true;
  intervalTimer: any;
  maxWaitReached: boolean = false;

  constructor(private http: HttpClient) {
    this.gameInit();
  }

  getQuote() {
    const url = 'https://api.quotable.io/random';
    this.http.get<any>(url).subscribe({
      next: (response: any) => this.randomText = response.content,
      error: (error: any) => console.error(error)
    });
  }

  gameInit() {
    this.getQuote();
    this.randomText = '';
    this.textEntered = '';
    this.timerPaused = true;
    this.maxWaitReached = false;
    this.timer = 0;
    this.score = 0;
  }

  nextQuote() {
    this.getQuote();
    this.timer = 0;
    this.textInput.nativeElement.value = '';
    this.textEntered = '';
  }

  resetHandler() {
    this.gameInit();
    this.pauseTimer();
  }

  startTimer() {
    this.intervalTimer = setInterval(() => {
      if (!this.timerPaused)
        this.timer += 0.1;
      if (this.timer > MAX_TIMER) {
        this.resetHandler();
        this.maxWaitReached = true;
      }
    }, 100);
  }

  pauseTimer() {
    clearInterval(this.intervalTimer);
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.textEntered = value;

    if (this.textEntered === this.randomText && this.timerPaused && this.timer === 0) {
      alert("Busted")
      this.resetHandler();
      this.gameInit()
      this.score = 0;
      return;
    }
    if (!this.timerPaused && this.textEntered === this.randomText) {
      this.timerPaused = true;
      const timeScore = (1 - this.timer / 60) * TIME_WEIGHT; // Normalize timer to a 0-1 range
      const lengthScore = this.textEntered.length / this.randomText.length * LENGTH_WEIGHT;
      const overallScore = (timeScore + lengthScore) * 100; // Multiply by 100 to get the score in percentage
      this.score += Number(overallScore.toFixed(2));
      this.pauseTimer();
    } else if (this.timerPaused) {
      this.timerPaused = false;
      this.startTimer();
    }
  }

  getColor(quoteChar: string, userChar: string) {
    if (!userChar) {
      return "quote";
    } else if (quoteChar === userChar) {
      return "match";
    } else {
      return "miss";
    }
  }
}
