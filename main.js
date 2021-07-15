'use strict'

const fs = require('fs');

/* * * * * * * * * * * * * * * * * *
 * Avec les Callbacks à l'anciene  *
 * * * * * * * * * * * * * * * * * */
function getContents(pDirPath, pCallback) {
    let retArray = [];
    let gotError = false;

    fs.readdir(pDirPath, 'utf8', (err, filesArray) => {
        if (err !== null) {
            pCallback(err, []);
            return ;
        }

        filesArray.forEach((file) => {
            if (gotError === false) {
                fs.readFile(pDirPath + file, 'utf8', (err, content) => {
                    if (err !== null) {
                        if (gotError === false) {
                            gotError = true;
                            pCallback(err, []);
                        }

                        return ;
                    }

                    if (gotError === false)  {
                        retArray.push(content);
                        if (retArray.length === filesArray.length) {
                            pCallback(null, retArray);
                        }
                    }
                });
            }
        });
    });
}
getContents('./files/', (err, contents) => {
    if (err !== null) {
        console.log(err);
    } else {
        console.log(contents);
    }
});

/* * * * * * * * * * *
 * Avec les promises *
 * * * * * * * * * * */
const readdirProm = (pPath, pOptions) => {
    return new Promise((resolve, reject) => {
        fs.readdir(pPath, pOptions, (err, filesNamesArray) => {
            if (err !== null) {
                reject(err);
                return ;
            }

            resolve(filesNamesArray);
            return ;
        });
    });
};

const readFileProm = (pFilePath, pOptions) => {
    return new Promise((resolve, reject) => {
        fs.readFile(pFilePath, pOptions, (err, fileContent) => {
            if (err !== null) {
                reject(err);
                return ;
            }

            resolve(fileContent);
            return ;
        });
    });
};

const getContentsProm = (pDirPath) => {
    return new Promise((resolve, reject) => {
        readdirProm(pDirPath, 'utf8')
            .then((filesNamesArray) => {
                let retContents = [];

                Promise.all(filesNamesArray.map((fileName) => {
                    return readFileProm(pDirPath + fileName, 'utf8')
                            .then((content) => retContents.push(content))
                            .catch((err) => reject(err));
                }))
                .then((content) => resolve(retContents))
                .catch((err) => reject(err));

            })
            .catch((err) => reject(err));
    });
};

getContentsProm('./files/')
    .then((content) => console.log(content))
    .catch((err) => console.log(err));
