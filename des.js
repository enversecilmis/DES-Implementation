const {
    textToBinaryArray,
    divideTo8CharArrays,
    xorBinaryStrings,
    permutateWithBitMap,
} = require("./utils");
const {
    SBoxes,
    SBoxBitMap,
    finalPermutationBitMap,
    initialPermutationBitMap,
} = require("./constants")
const { generateRoundKeys } = require( "./key_utils");






const encryptDES = (input, key) => {
    if(key.length > 8){
        console.log("key length must be under 9 character");
        return
    }

    let binaryArray = textToBinaryArray(input)
    let dividedBinaryArrays = divideTo8CharArrays(binaryArray)

    let encrypted = dividedBinaryArrays.map((val) => {return startEncryption(val, key)}).join("")

    let encryptedString = ""
    for (let i=0; i<encrypted.length/8; i++){
        let char = encrypted.substring(i*8,i*8+8)
        encryptedString += String.fromCharCode(parseInt(char,2))
    }
    return encryptedString
}



const startEncryption = (binArray, key) => {
    binArray = binArray.join("")

    let initPermResult = permutateWithBitMap(binArray, initialPermutationBitMap)// initial permutation
    let des16FinalRoundResult = des16Rounds(initPermResult, generateRoundKeys(key))
    let finalPermResult = permutateWithBitMap(des16FinalRoundResult, finalPermutationBitMap)// final permutation

    return finalPermResult
}

const decryptDES = (cipherText, key) => {
    if(key.length > 8){
        console.log("key length must be under 9 character");
        return
    }

    let binaryArray = textToBinaryArray(cipherText)
    let dividedBinaryArrays = divideTo8CharArrays(binaryArray)


    let decrypted = dividedBinaryArrays.map((val) => {return startDecryption(val, key)}).join("")
    
    let decryptedString = ""
    for (let i=0; i<decrypted.length/8; i++){
        let char = decrypted.substring(i*8,i*8+8)
        decryptedString += String.fromCharCode(parseInt(char,2))
    }

    return decryptedString
}

const startDecryption = (binArray, key) => {
    binArray = binArray.join("")

    let initPermResult = permutateWithBitMap(binArray, initialPermutationBitMap)// initial permutation
    let des16FinalRoundResult = des16Rounds(initPermResult, generateRoundKeys(key).reverse())
    let finalPermResult = permutateWithBitMap(des16FinalRoundResult, finalPermutationBitMap)// final permutation

    return finalPermResult
}



const des16Rounds = (binArray, roundKeysArray) => {
    let roundInput = binArray

    // 16 D??ng??leri
    for(let i = 0; i < 16; i++){
        
        // 
        let leftInput = roundInput.substring(0,32)
        let rightInput = roundInput.substring(32,64)
        let roundKey = roundKeysArray[i]


        // sa?? taraf?? sol tarafa kopyala
        let oldLeftInput = leftInput
        leftInput = rightInput


        // rightInput'un ba????na son eleman??n??, sonuna ba?? eleman??n?? ekle
        let rightInputSemiExtended = rightInput[rightInput.length-1] + rightInput + rightInput[0]
        
        
        
        // rightInputu XOR'lanabilecek boyuta getir
        let rightInputExtended = ""
        for(let i=0; i<8; i++)
            for(let j=i*4; j<i*4+6; j++)
                rightInputExtended += rightInputSemiExtended[j]

                
                
                
        // XOR RoundKey rightInput
        let rightInputXOR = xorBinaryStrings(rightInputExtended, roundKey)
        


        // S BOX i??lemleri
        let sBoxValuesAll = ""
        for(let i=0; i<8; i++){
            let rowBits = rightInputXOR[i*6] + rightInputXOR[i*6+5]
            let columnBits = rightInputXOR.slice(i*6+1,i*6+5)
            let row = parseInt(rowBits,2)
            let column = parseInt(columnBits,2)
            
            let sValue = SBoxes[i][row][column]
            sValue = sValue.toString(2)

            let length = sValue.length
            for(let i=0; i<(4-length); i++){
                sValue = '0' + sValue
            }
            sBoxValuesAll += sValue
        }



        // S-Box i??lemleri sonras?? perm??tasyon
        let sBoxPermutationResult = permutateWithBitMap(sBoxValuesAll, SBoxBitMap)


        // sonraki ad??m??n giri??ini ayarla
        rightInput = xorBinaryStrings(sBoxPermutationResult,oldLeftInput)
        roundInput = leftInput + rightInput
    }
    let finalRoundOutput = roundInput
    
    let left32 = finalRoundOutput.substring(0,32)
    let right32 = finalRoundOutput.substring(32,64)
    finalRoundOutput = right32 + left32

    return finalRoundOutput
}

const generateSymKey = () => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh';
    
    for (let i=0; i<8; i++)
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    
    return result;
}


module.exports = {
    encryptDES,
    decryptDES,
    generateSymKey,
}