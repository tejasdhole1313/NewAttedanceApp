import { FaceSDK, MatchFacesImage, MatchFacesRequest } from '@regulaforensics/face-sdk';

export async function matchFaceImages(image1: MatchFacesImage, image2: MatchFacesImage) {
  const response = await FaceSDK.instance.matchFaces(new MatchFacesRequest([image1, image2]));
  const result = await FaceSDK.instance.splitComparedFaces(response.results, 0.75);
  return result.matchedFaces;
}
