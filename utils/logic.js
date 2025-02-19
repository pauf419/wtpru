class Logic {
    regexobject(o) {
        return Object.values(o).map(e => !e || String(e).trim() === "" ? true : false).includes(true)
    }

    generateSQLUpdateValues(o, acceptableKeys) {
        const oKeys = Object.keys(o)
        const oValues = Object.values(o)
        const keys = [] 
        const values = []

        for(var i=0;i < oKeys.length;i++) {
            if(!acceptableKeys.includes(oKeys[i]) || !oValues[i]) continue
            keys.push(oKeys[i])
            values.push(oValues[i])
        }

        return {
            keys,
            values
        }
    }

    generateSQLUpdateScript(tableName, OKVs, id) {
        var script = `UPDATE ${tableName} SET `
        var globalNumerator = 1
        var vars = []
        for(var i=0;i < OKVs.keys.length;i++) {
            var chunk = `${OKVs.keys[i]} = $${globalNumerator}`
            globalNumerator++
            vars.push(OKVs.values[i])
            if(i === (OKVs.keys.length - 1)) {
                script += chunk
                break
            }
            script += chunk +=", " 
        }
        return {
            script: `${script} WHERE id = $${globalNumerator} RETURNING *`,
            vars: [...vars, id]
        }
    }
}

module.exports = new Logic() 