package com.urlshortner.urlshortener.models;

public class CustomizedResponse {
    private boolean status;
	private String message;
	private Object data;
	private long statusCode;
	private String token;
	private Integer expiresInSec;


	public CustomizedResponse(String message, Object data){
		super();
		this.message = message;
		this.data = data;
	}


	public CustomizedResponse(boolean status, String message) {
		super();
		this.status = status;
		this.message = message;
	}

	public CustomizedResponse(boolean status, String message, Object data) {
		super();
		this.status = status;
		this.message = message;
		this.data = data;
	}

	public CustomizedResponse(boolean status, String message, long statusCode, Object data) {
		super();
		this.status = status;
		this.message = message;
		this.data = data;
		this.statusCode = statusCode;
	}
	
	public CustomizedResponse(boolean status, String message, long statusCode, Object data, String token, Integer expiresInSec) {
		super();
		this.status = status;
		this.message = message;
		this.data = data;
		this.statusCode = statusCode;
		this.token = token;
		this.expiresInSec = expiresInSec;
	}
	
	public boolean getStatus() {
		return status;
	}
	public void setStatus(boolean status) {
		this.status = status;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	public Object getData() {
		return data;
	}
	public void setData(Object data) {
		this.data = data;
	}
	public String getToken() {
		return token;
	}
	public void setToken(String token) {
		this.token = token;
	}
	public long getStatusCode() {
		return statusCode;
	}
	public void setStatusCode(long statusCode) {
		this.statusCode = statusCode;
	}

	public Integer getExpiresInSec() {
		return expiresInSec;
	}

	public void setExpiresInSec(Integer expiresInSec) {
		this.expiresInSec = expiresInSec;
	}

	@Override
	public String toString() {
		return "CustomizedResponse [status=" + status + ", message=" + message + ", data=" + data + ", statusCode="
				+ statusCode + ", token=" + token + "]";
	}
}
