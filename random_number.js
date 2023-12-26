export function uniqueRandomNumber(min, max) {
    if (!uniqueRandomNumber.generatedNumbers) {
      uniqueRandomNumber.generatedNumbers = [];
    }
  
    const range = max - min + 1;
    
  
    let randomNumber;
    do {
      randomNumber = Math.floor(Math.random() * range) + min;
    } while (uniqueRandomNumber.generatedNumbers.includes(randomNumber));
  
    uniqueRandomNumber.generatedNumbers.push(randomNumber);
  
    return randomNumber;
}
  