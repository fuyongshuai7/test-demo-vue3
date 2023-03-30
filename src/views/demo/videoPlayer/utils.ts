/**
 * Base64转
 * @param base64 String base64格式字符串
 * @param contentType String file对象的文件类型，如："image/png", 不懂可以搜一下MIME type
 * @param filename String 文件名称或者文件路径
 */
export const turnBase64ImgToFile = (base64: string, filename: string, contentType: string) => {
	const arr = base64.split(","); //去掉base64格式图片的头部
	const bstr = atob(arr[1]); //atob()方法将数据解码
	let leng = bstr.length;
	const u8arr = new Uint8Array(leng);
	while (leng--) {
		u8arr[leng] = bstr.charCodeAt(leng); //返回指定位置的字符的 Unicode 编码
	}
	return new File([u8arr], filename, { type: contentType });
}