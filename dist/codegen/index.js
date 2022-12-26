"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codegenContractTypings = void 0;
const lodash_1 = require("lodash");
const typechain_1 = require("typechain");
const functions_1 = require("./functions");
function codegenContractTypings(contract, codegenConfig) {
    const source = `
  export default class ${(0, typechain_1.normalizeName)(contract.name)}Queries {
    readonly contractAddress: string;
    readonly networkId?: {chainId: number };
    
    constructor(contractAddress: string, networkId?: number) {
      this.networkId = networkId ? { chainId: networkId } : undefined;
      this.contractAddress = contractAddress;
    }
  
    ${(0, lodash_1.values)(contract.functions)
        .map(functions_1.codegenFunctions.bind(null, { returnResultObject: true, codegenConfig, contractName: contract.name }))
        .join('\n')}
  }
    `;
    const imports = (0, typechain_1.createImportsForUsedIdentifiers)({
        'type ethers': [
            'BaseContract',
            'BigNumber',
            'BigNumberish',
            'BytesLike',
            'CallOverrides',
            'ContractTransaction',
            'Overrides',
            'PayableOverrides',
            'PopulatedTransaction',
            'utils',
            'ContractReceipt',
        ],
        'type @ethersproject/abi': ['FunctionFragment', 'Result', 'EventFragment'],
        'type @ethersproject/providers': ['Listener', 'Provider'],
    }, source) +
        '\n' +
        `import { ${contract.name}__factory } from "../index.ts"
     import { useProvider, useSigner } from "wagmi";
     import { useQuery, useMutation } from "@tanstack/react-query";
    `;
    return imports + source;
}
exports.codegenContractTypings = codegenContractTypings;
//# sourceMappingURL=index.js.map