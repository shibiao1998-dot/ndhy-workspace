"""
AIAE Gateway 模型快速测试工具
用法: python test_model.py <model_id> [prompt]
"""
import os, sys, json, base64, time
from pathlib import Path

def load_env():
    env_path = Path(__file__).parent.parent.parent.parent / ".env"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if "=" in line and not line.startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

def get_client():
    try:
        from openai import OpenAI
    except ImportError:
        print("需要安装 openai: pip install openai python-dotenv")
        sys.exit(1)
    load_env()
    return OpenAI(
        api_key=os.getenv("AIAE_API_KEY"),
        base_url=os.getenv("AIAE_BASE_URL", "https://ai-gateway.aiae.ndhy.com/v1"),
    )

# 图像模型列表（通过 chat/completions 调用）
CHAT_IMAGE_MODELS = {
    "gemini-3.1-flash-image-preview",
    "gemini-3-pro-image-preview", 
    "gemini-2.5-flash-image",
}

# 图像模型列表（通过 images/generations 调用）
IMAGES_API_MODELS = {
    "gpt-image-1", "gpt-image-1.5",
    "doubao-seedream-5-0-260128", "doubao-seedream-4-5-251128",
    "doubao-seedream-4-0-250828", "doubao-seedream-3-0-t2i-250415",
    "hunyuan-image-3", "MidJourney",
}

def test_chat(client, model, prompt):
    """测试文本对话模型"""
    print(f"📝 测试文本模型: {model}")
    t0 = time.time()
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=500,
    )
    elapsed = time.time() - t0
    content = resp.choices[0].message.content
    usage = resp.usage
    print(f"✅ 响应 ({elapsed:.1f}s):")
    print(content[:500])
    if hasattr(usage, 'total_price'):
        print(f"\n💰 费用: ¥{usage.total_price}")
    print(f"📊 Token: in={usage.prompt_tokens} out={usage.completion_tokens}")

def test_chat_image(client, model, prompt):
    """测试通过 chat 端点生成图像"""
    print(f"🎨 测试图像模型(chat): {model}")
    t0 = time.time()
    resp = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=4096,
    )
    elapsed = time.time() - t0
    content = resp.choices[0].message.content
    print(f"✅ 响应 ({elapsed:.1f}s), 内容长度: {len(content)} chars")
    # 尝试提取和保存 base64 图片
    if "inline_data" in content or len(content) > 10000:
        out_file = f"test_{model.replace('/', '_')}_{int(time.time())}.png"
        try:
            # 多种可能的返回格式
            if content.startswith("data:image"):
                b64 = content.split(",", 1)[1]
            else:
                b64 = content  # 可能直接是 base64
            Path(out_file).write_bytes(base64.b64decode(b64))
            print(f"💾 图片已保存: {out_file}")
        except Exception:
            print(f"⚠️ 无法自动提取图片，原始内容已打印前200字符:")
            print(content[:200])

def test_images_api(client, model, prompt):
    """测试通过 images 端点生成图像"""
    print(f"🎨 测试图像模型(images): {model}")
    t0 = time.time()
    resp = client.images.generate(
        model=model, prompt=prompt, n=1, size="1024x1024",
    )
    elapsed = time.time() - t0
    print(f"✅ 响应 ({elapsed:.1f}s)")
    data = resp.data[0]
    if data.b64_json:
        out_file = f"test_{model.replace('/', '_')}_{int(time.time())}.png"
        Path(out_file).write_bytes(base64.b64decode(data.b64_json))
        print(f"💾 图片已保存: {out_file}")
    elif data.url:
        print(f"🔗 图片URL: {data.url}")

def main():
    if len(sys.argv) < 2:
        print("用法: python test_model.py <model_id> [prompt]")
        print("示例:")
        print("  python test_model.py doubao-seed-2-0-pro-260215 '你好'")
        print("  python test_model.py gemini-3.1-flash-image-preview 'Generate a UI mockup'")
        print("  python test_model.py gpt-image-1 '一只猫'")
        sys.exit(1)
    
    model = sys.argv[1]
    prompt = sys.argv[2] if len(sys.argv) > 2 else "你好，请用一句话介绍你自己"
    
    client = get_client()
    
    if model in CHAT_IMAGE_MODELS:
        if prompt == "你好，请用一句话介绍你自己":
            prompt = "Generate a modern dark-theme dashboard UI mockup"
        test_chat_image(client, model, prompt)
    elif model in IMAGES_API_MODELS:
        if prompt == "你好，请用一句话介绍你自己":
            prompt = "A modern dark-theme dashboard UI mockup, professional design"
        test_images_api(client, model, prompt)
    else:
        test_chat(client, model, prompt)

if __name__ == "__main__":
    main()
