import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const TIME_WEIGHT = 0.5;
const LENGTH_WEIGHT = 0.5;
const MAX_TIMER = 3 * 60;
const MIN_QUOTE_LENGTH = 50;
const MAX_QUOTE_LENGTH = 150;
const MAX_GAME_LENGTH = 5;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('userInput', { static: false }) textInput!: ElementRef<HTMLInputElement>;

  // Game properties
  score: number = 0;
  randomText = '';
  textEntered = '';
  timer: number = 0;
  timerPaused: boolean = true;
  maxWaitReached: boolean = false;
  intervalTimer: any;
  maxQuotes: number = MAX_GAME_LENGTH;
  currQuote: number = 0;

  constructor(private http: HttpClient) {
    this.gameInit();
  }

  // Retrieve a random quote from the API
  getQuote() {
    const url = `https://api.quotable.io/random?minLength=${MIN_QUOTE_LENGTH}&maxLength=${MAX_QUOTE_LENGTH}`;
    this.http.get<any>(url).subscribe({
      next: (response: { _id: string, content: string }) => {
        this.randomText = response.content;
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  // Initialize the game state
  gameInit() {
    this.getQuote();
    this.randomText = '';
    this.textEntered = '';
    this.timerPaused = true;
    this.maxWaitReached = false;
    this.timer = 0;
    this.score = 0;
    this.currQuote = 0;
  }

  // Move to the next quote
  nextQuote() {
    this.getQuote();
    this.timer = 0;
    this.textInput.nativeElement.value = '';
    this.textEntered = '';
  }

  // Reset the game state
  resetHandler() {
    this.gameInit();
    this.pauseTimer();
  }

  // Start the timer
  startTimer() {
    this.intervalTimer = setInterval(() => {
      if (!this.timerPaused) {
        this.timer += 0.1;
      }
      if (this.timer > MAX_TIMER) {
        this.resetHandler();
        this.maxWaitReached = true;
      }
    }, 100);
  }

  // Pause the timer
  pauseTimer() {
    clearInterval(this.intervalTimer);
  }

  // Handle user input
  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    this.textEntered = value;

    if (this.textEntered === this.randomText && this.timerPaused && this.timer === 0) {
      // User entered text matches the quote, but the user haven't typed yet
      alert("Busted");
      this.resetHandler();
      this.score = 0;
      this.gameInit();
      return;
    }

    if (!this.timerPaused && this.textEntered === this.randomText) {
      // User entered text matches the quote and timer is running
      this.timerPaused = true;
      const timeScore = (1 - this.timer / 60) * TIME_WEIGHT; // Normalize timer to a 0-1 range
      const lengthScore = this.textEntered.length / this.randomText.length * LENGTH_WEIGHT;
      const overallScore = (timeScore + lengthScore) * 100; // Multiply by 100 to get the score in percentage
      this.score += Number(overallScore.toFixed(2));
      this.pauseTimer();
      this.currQuote++;
    } else if (this.timerPaused) {
      // Timer is paused, start it
      this.timerPaused = false;
      this.startTimer();
    }
  }

  // Clear the input text
  deleteInput() {
    this.textInput.nativeElement.value = '';
    this.textEntered = '';
  }

  // Determine the color of a character in the quote for styling
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