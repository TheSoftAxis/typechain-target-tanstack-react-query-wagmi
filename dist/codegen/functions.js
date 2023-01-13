"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codegenForOverloadedFunctions = exports.codegenFunctions = void 0;
const typechain_1 = require("typechain");
const types_1 = require("./types");
function codegenFunctions(options, fns) {
    if (fns.length === 1) {
        if (options.codegenConfig.alwaysGenerateOverloads) {
            return generateFunction(options, fns[0], options.contractName) + codegenForOverloadedFunctions(options, fns);
        }
        else {
            return generateFunction(options, fns[0], options.contractName);
        }
    }
    return codegenForOverloadedFunctions(options, fns);
}
exports.codegenFunctions = codegenFunctions;
function codegenForOverloadedFunctions(options, fns) {
    return fns.map((fn) => generateFunction(options, fn, options.contractName, `"${(0, typechain_1.getSignatureForFn)(fn)}"`)).join('\n');
}
exports.codegenForOverloadedFunctions = codegenForOverloadedFunctions;
function generateFunction(options, fn, contractName, overloadedName) {
    let inputTypes = (0, types_1.generateInputTypes)(fn.inputs, { useStructs: true })
    let inputNames = (0, types_1.generateInputNames)(fn.inputs)
    
    inputNames += `overrides`

    if (options.isStaticCall || fn.stateMutability === 'pure' || fn.stateMutability === 'view') {
        inputTypes += `overrides?: CallOverrides`
        return `
    ${generateFunctionDocumentation(fn.documentation)}
    ${`use${(0, typechain_1.normalizeName)(fn.name)}Query`} = (${inputTypes}) => {
      const provider = useProvider(this.networkId);
      const contract = ${contractName}__factory.connect(this.contractAddress, provider);
      return useQuery<${(0, types_1.generateOutputTypes)({ useStructs: true }, fn.outputs)}>(["${fn.name}", "${contractName}", ${inputNames}], async () => {
        return await contract.${fn.name}( ${inputNames});
      });
    };
  `;
    }
    if (fn.stateMutability === 'payable') {
        inputTypes += `overrides?: PayableOverrides & { from?: PromiseOrValue<string> }`
    } else {
        inputTypes += `overrides?: Overrides & { from?: PromiseOrValue<string> }`
    }
    return `
  ${generateFunctionDocumentation(fn.documentation)}
  ${`use${fn.name.charAt(0).toUpperCase() + fn.name.slice(1)}Mutation`} = () => {
  const { data: signer } = useSigner();
  return useMutation<ContractReceipt, Error, {${inputTypes}}>(
    async ({${inputNames}}) => {
        if (!signer) throw new Error('Signer is not set');
        const contract = ${contractName}__factory.connect(this.contractAddress, signer);
        const transaction = await contract.${fn.name} (${inputNames});
        return transaction.wait()
    }
  );
};
`;
}
function generateFunctionDocumentation(doc) {
    if (!doc)
        return '';
    let docString = '/**';
    if (doc.details)
        docString += `\n * ${doc.details}`;
    if (doc.notice)
        docString += `\n * ${doc.notice}`;
    const params = Object.entries(doc.params || {});
    if (params.length) {
        params.forEach(([key, value]) => {
            docString += `\n * @param ${key} ${value}`;
        });
    }
    if (doc.return)
        docString += `\n * @returns ${doc.return}`;
    docString += '\n */';
    return docString;
}
//# sourceMappingURL=functions.js.map