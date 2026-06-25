"""中药十八反十九畏配伍禁忌知识库

十八反:
- 本草明言十八反
- 半蒌贝蔹及攻乌
- 藻戟遂芫俱战草
- 诸参辛芍叛藜芦

十九畏:
- 硫黄原是火中精，朴硝一见便相争
- 水银莫与砒霜见，狼毒最怕密陀僧
- 巴豆性烈最为上，偏与牵牛不顺情
- 丁香莫与郁金见，牙硝难合京三棱
- 川乌草乌不顺犀，人参最怕五灵脂
- 官桂善能调冷气，若逢石脂便相欺
"""

# ══════════════════════════════════════════
# 十八反
# ══════════════════════════════════════════

# 乌头（川乌、草乌、附子）反 半夏、瓜蒌（全瓜蒌、瓜蒌皮、瓜蒌仁、天花粉）、
# 贝母（川贝母、浙贝母）、白蔹、白及
WU_TOU_GROUP = ["川乌", "草乌", "附子", "制川乌", "制草乌", "制附子"]
WU_TOU_ANTAGONISTS = ["半夏", "法半夏", "姜半夏", "清半夏", "瓜蒌", "全瓜蒌", "瓜蒌皮",
                      "瓜蒌仁", "天花粉", "川贝母", "浙贝母", "贝母", "白蔹", "白及"]

# 甘草反 海藻、大戟、甘遂、芫花
GAN_CAO_GROUP = ["甘草", "炙甘草", "生甘草"]
GAN_CAO_ANTAGONISTS = ["海藻", "大戟", "甘遂", "芫花", "京大戟", "红大戟"]

# 藜芦反 人参、沙参、丹参、玄参、细辛、芍药
LI_LU_GROUP = ["藜芦"]
LI_LU_ANTAGONISTS = ["人参", "红参", "生晒参", "西洋参", "党参", "沙参", "南沙参",
                     "北沙参", "丹参", "玄参", "苦参", "细辛", "白芍", "赤芍", "芍药"]

EIGHTEEN_ANTAGONISMS = [
    (WU_TOU_GROUP, WU_TOU_ANTAGONISTS, "十八反: 乌头（川乌、草乌、附子）反半夏、瓜蒌、贝母、白蔹、白及"),
    (GAN_CAO_GROUP, GAN_CAO_ANTAGONISTS, "十八反: 甘草反海藻、大戟、甘遂、芫花"),
    (LI_LU_GROUP, LI_LU_ANTAGONISTS, "十八反: 藜芦反人参、沙参、丹参、玄参、细辛、芍药"),
]


# ══════════════════════════════════════════
# 十九畏
# ══════════════════════════════════════════

NINETEEN_INCOMPATIBILITIES = [
    (["硫黄"], ["朴硝", "芒硝", "玄明粉", "硝石"], "硫黄畏朴硝"),
    (["水银"], ["砒霜", "信石"], "水银畏砒霜"),
    (["狼毒"], ["密陀僧"], "狼毒畏密陀僧"),
    (["巴豆", "巴豆霜"], ["牵牛子", "黑丑", "白丑"], "巴豆畏牵牛"),
    (["丁香", "公丁香", "母丁香"], ["郁金"], "丁香畏郁金"),
    (["牙硝", "芒硝", "玄明粉"], ["京三棱", "三棱"], "牙硝畏三棱"),
    (["川乌", "草乌", "制川乌", "制草乌"], ["犀角", "水牛角", "广角"], "川乌草乌畏犀角"),
    (["人参", "红参", "生晒参"], ["五灵脂"], "人参畏五灵脂"),
    (["官桂", "肉桂", "桂枝"], ["赤石脂", "白石脂", "禹余粮"], "官桂畏石脂"),
]


def check_compatibility(herbs: list[str]) -> list[dict]:
    """检查处方中的配伍禁忌
    
    Args:
        herbs: 处方中的药名列表
        
    Returns:
        禁忌列表，每条包含 type/level/herb_a/herb_b/message
    """
    findings = []
    herb_set = set(h.strip() for h in herbs if h and h.strip())

    # 检查十八反
    for group, antagonists, message in EIGHTEEN_ANTAGONISMS:
        found_group = [h for h in herb_set if any(g in h for g in group)]
        found_anti = [h for h in herb_set if any(a in h for a in antagonists)]
        if found_group and found_anti:
            findings.append({
                "type": "十八反",
                "level": "error",
                "herbs_a": found_group,
                "herbs_b": found_anti,
                "message": message,
                "detail": f"处方中同时含有【{','.join(found_group)}】和【{','.join(found_anti)}】，属于十八反禁忌",
            })

    # 检查十九畏
    for group_a, group_b, message in NINETEEN_INCOMPATIBILITIES:
        found_a = [h for h in herb_set if any(a in h for a in group_a)]
        found_b = [h for h in herb_set if any(b in h for b in group_b)]
        if found_a and found_b:
            findings.append({
                "type": "十九畏",
                "level": "error",
                "herbs_a": found_a,
                "herbs_b": found_b,
                "message": message,
                "detail": f"处方中同时含有【{','.join(found_a)}】和【{','.join(found_b)}】，属于十九畏禁忌",
            })

    # 检查孕妇禁忌
    pregnancy_forbidden = ["水蛭", "虻虫", "斑蝥", "麝香", "穿山甲", "甘遂", "大戟", "芫花", "巴豆", "牵牛子", "商陆", "三棱", "莪术"]
    found_preg = [h for h in herb_set if h in pregnancy_forbidden]
    if found_preg:
        findings.append({
            "type": "孕妇禁忌",
            "level": "error",
            "herbs_a": found_preg,
            "herbs_b": [],
            "message": "孕妇禁用/慎用药",
            "detail": f"处方中含有孕妇禁忌药：【{','.join(found_preg)}】",
        })

    # 检查剂量异常（超过常规剂量）
    dose_limits = {"制附子": 15, "川乌": 9, "草乌": 9, "细辛": 6, "巴豆霜": 0.6, "甘遂": 1.5, "大戟": 1.5, "马钱子": 0.6}

    return findings
