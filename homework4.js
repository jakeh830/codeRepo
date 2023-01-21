// Returns a random int i where min <= i < max
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

//generates a NxN array of values where each array is a random permutation of 0 to N
//generateInput(n: number): number[][]
function generateInput(n) {
  let arr = [];
  for (let i = 0; i < n; ++i) {
    arr.push(i);
  }
  let returnArr = [];
  for (let i = 0; i < n; ++i) {
    returnArr.push(shuffle(arr.slice(0, arr.length)));
  }
  return returnArr;
}

// randomly shuffles array and returns it, based off pseudo code of fisher-yates shuffle found 
// here https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
//shuffle(arr: number[]): number[]
function shuffle(arr) {
  let k, temp, j = arr.length;
  while(--j > 0) {
    k = randomInt(0,j);
    temp = arr[k];
    arr[k] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

//runOracle(f: (companies: number[][], candidates: number[][]) => Run): void
function runOracle(f) {
let numTests = 20; // Change this to some reasonably large value
  for (let i = 0; i < numTests; ++i) {
    let n = 20; // Change this to some reasonable size
    let companies = generateInput(n);
    let candidates = generateInput(n);
    let run = f(companies, candidates);
    let hires = run.out;
    let offers = run.trace;
    let curCandMatches = [], curCompMatches = [], compCurPref = [], candCurPref = [];
    for (let i = 0; i < n; ++i) {
      compCurPref.push(0);
      candCurPref.push(0);
      curCandMatches.push(-1);
      curCompMatches.push(-1);
    }
    //takes in a candidate or company and returns true is if has already found a match
    //isAlreadyMatched(party: number, matches: number[]): boolean
    function isAlreadyMatched(party, matches) {
      return !(matches[party] === -1);
    }
    //returns true if the Offer's propositioner (Offer.from) is making an offer towards it's next preference
    //isNextPref(offer: Offer, party1: number[], curPref: number): boolean
    function isNextPref(offer, party1, curPref) {
      return (offer.to === party1[offer.from][curPref]);
    }
    //will return true is Offer (i) has already been made and is thus a repeat
    //isRepeatProposal(i: Offer): boolean
    function isRepeatProposal(i) {
      let numFound = 0;
      offers.forEach(e => {
        if (e.from === i.from && e.to === i.to && e.fromCo === i.fromCo) {
          ++numFound;
        }
      });
      return numFound > 1;
    }
    //returns the validity of the Offers found in run.trace.  Returns true if they are valid, false otherwise
    //isValid(): boolean
    function isValid() {
      let isValid = true;
      offers.forEach(e => {
        if (e.fromCo) {
          isValid = updateMatches(e, companies, candidates, curCompMatches, curCandMatches, compCurPref, candCurPref);
        }
        else {
          isValid = updateMatches(e, candidates, companies, curCandMatches, curCompMatches, candCurPref, compCurPref);
        }
      });
      return isValid;
    }
    /*This function will take in a list of arrays that are references to candidates and companies or companies and candidates (order
    depends on if offer's from field is a company/candidate.  Function will then check if a potential match is valid, returning false otherwise.
    If the match is valid, it will match the offer's members, iterate the offer proposer's preferences, and return true */
    //updateMatches(offer: Offer, party1: number[], party2: number[], curP1Matches: number[], curP2Matches: number[], p1CurPref: number[], p2CurPref: number[]): boolean
    function updateMatches(offer, party1, party2, curP1Matches, curP2Matches, p1CurPref, p2CurPref) {
      if (!isNextPref(offer, party1, p1CurPref[offer.from]) || isRepeatProposal(offer)) {
        return false;
      }
      if (!isAlreadyMatched(offer.to, curP2Matches) || party2.indexOf(offer.from) < party2.indexOf(curP2Matches[offer.to])) {
        curP1Matches[offer.from] = offer.to;
        curP2Matches[offer.to] = offer.from
      }
      ++p1CurPref[offer.from];
      return true;
    }

    test('isValid', function() {
      assert(isValid());
    });
  }
}

const oracleLib = require('oracle');
runOracle(oracleLib.traceWheat1);
runOracle(oracleLib.traceChaff1);
