/*----------------------------------------*\
  progra - index.js
  @author Evrard Vincent (vincent@ogre.be)
  @Date:   2019-11-04 17:26:38
  @Last Modified time: 2019-11-25 12:46:25
\*----------------------------------------*/
const SimplexNoise = require('simplex-noise');
const say = require('say');
const fs = require('fs');

const simplex = new SimplexNoise();
const stopChar = ".!?:;,";
const minGramLength = 2;
const maxGramLength = 10;

let xOff = 0, xInc=0.001;
let yOff = 0, yInc=0.011;

learn(fs.readFileSync("./apocalypse.txt", "utf8"))
.then(dataBase => {
	loop(dataBase, "RÉVÉLATION de Jésus-Christ")
});

function learn(txt){
	let nGrams = {};
	return new Promise((resolve, reject)=>{
		for(var n = minGramLength ; n <= maxGramLength ; n ++ ){
			nGrams[n] = {};
			for(var i = 0 ; i <= txt.length-n ; i ++){
				var gram = txt.substr(i, n);
				if(!nGrams[n][gram]){
					nGrams[n][gram] = [];
				}
				nGrams[n][gram].push(txt.charAt(i + n));
			}
		}
		return resolve(nGrams);
	});
}

function loop(dataBase, text){
	addChar(dataBase, text, getGramLength())
	.then(text => {
		let splitted = text.match(/[^\.!\?:;,]+/g);
		readSentence(splitted[splitted.length-1].trim()+text.substr(-1))
		.then(() => loop(dataBase, text));
	})
	.catch(error => console.log(error));
}

function addChar(dataBase, text, gramLength){
	return new Promise((resolve, reject)=>{
		if(text.length<gramLength)return reject("ERROR : currentText.length<n");
		let lastNGram = text.substr(-gramLength);
		let possibilities = dataBase[gramLength][lastNGram];
		if(!possibilities)return resolve(text);
		let nextChar = possibilities[random(possibilities.length)];
		text += nextChar;
		if(stopChar.indexOf(nextChar) > -1){
			return resolve(text);
		}else{
			return addChar(dataBase, text, getGramLength())
			.then(text => resolve(text))
			.catch(error => reject(error));
		}
	});
}

function readSentence(s){
	console.log(s);
	return new Promise((resolve, reject)=>{
		say.speak(s, 'Thomas', 1, (err)=>{
			resolve();
		});
	});
}

function getGramLength(){
	let noise = (simplex.noise2D(xOff+=xInc, yOff+=yInc) + 1) * 0.5;
	noise = lerp(minGramLength, maxGramLength, noise);
	noise = Math.floor(noise);
	let c = "";
	for(let i = 0 ; i < noise ; i ++) c+="█";
	//console.log(c);
	return noise;
}

function random(max){ // return [0, max[
	return Math.floor(Math.random() * max);
}

function lerp (start, end, amt){
  return (1-amt)*start+amt*end
}
