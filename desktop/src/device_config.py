"""设备接入框架 - AI服务模块"""

# 设备类型
DEVICE_TYPES = {
    "pulse":  "脉诊仪",
    "tongue": "舌诊仪",
    "face":   "面诊仪",
    "voice":  "声诊仪",
}

# AI分析模块
AI_MODULES = {
    "tongue_analysis": {
        "name": "舌诊分析",
        "model": "tongue_vit",
        "input": "tongue_image",
        "output": ["tongue_body", "tongue_coating", "tongue_shape"],
    },
    "face_analysis": {
        "name": "面诊分析",
        "model": "face_resnet",
        "input": "face_image",
        "output": ["complexion", "spirit"],
    },
    "voice_analysis": {
        "name": "声诊分析",
        "model": "voice_wav2vec",
        "input": "audio_file",
        "output": ["voice_quality", "speech_pattern"],
    },
    "pulse_analysis": {
        "name": "脉诊分析",
        "model": "pulse_cnn",
        "input": "pulse_wave",
        "output": ["pulse_depth", "pulse_shape", "pulse_force"],
    },
}
