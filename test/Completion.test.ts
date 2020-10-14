import { Completion } from "../src/domain/Completion"
import * as should from "should"

describe("Completion", () => {
  // given
  const log = {
    log: (msf: string) => { console.log(msf) },
    error: () => { },
    warn: () => { },
  }

  const dictionary = {
    "ho": "hello",
    "hot": "hotel",
    "nd": "noticed",
    "nn": "notion",
    "atn": "attention"
  }
  const completion = new Completion(dictionary, log)

  context("words", () => {
    it("proposes all words", () => {
      const completions = completion.complete("This ", 5)
    })
    it("proposes corresponding words (2 letters, ignore case)", () => {
      const completions = completion.complete("This Ho", 7)
      should(completions).containEql("hello")
      should(completions).containEql("hotel")
      should(completions).not.containEql("noticed")
    })
    it("proposes corresponding words (1 letter)", () => {
      const completions = completion.complete("This n", 6)
      should(completions).containEql("noticed")
      should(completions).containEql("notion")
      should(completions).not.containEql("attention")
    })

    it("proposes corresponding words and filter out others", () => {
      const completions = completion.complete("This nd", 7)
      should(completions).containEql("noticed")
      should(completions).not.containEql("notion")
      should(completions).not.containEql("attention")
    })
    it("proposes nothing if nothing matches", () => {
      const completions = completion.complete("This de", 7)
      should(completions).be.empty()
    })
    it("doesn't propose for previous line", () => {
      const completions = completion.complete("This n\nd", 8)
      should(completions).be.empty()
    })
    it("proposes for new line", () => {
      const completions = completion.complete("This n\nn", 6)
      should(completions).containEql("noticed")
      should(completions).containEql("notion")
    })
    it("proposes for first letter of string", () => {
      const completions = completion.complete("n", 1)
      should(completions).containEql("noticed")
      should(completions).containEql("notion")
    })
  })

})