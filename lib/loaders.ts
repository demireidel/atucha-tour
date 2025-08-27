import { KTX2Loader } from "three-stdlib"
import { DRACOLoader } from "three-stdlib"
import { MeshoptDecoder } from "three-stdlib"

// Configure KTX2 loader for compressed textures
export const ktx2Loader = new KTX2Loader()
ktx2Loader.setTranscoderPath("/wasm/")

// Configure Draco loader for compressed geometry
export const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath("/wasm/")

// Configure Meshopt decoder
export const meshoptDecoder = MeshoptDecoder

// Utility function to setup loaders
export function setupLoaders() {
  // Enable Draco compression
  dracoLoader.preload()

  // Enable KTX2 texture compression
  ktx2Loader.detectSupport(document.createElement("canvas").getContext("webgl2")!)
}
