"""
main.py — 提示词工程系统入口

用法：
    python main.py --task "设计一个化学实验交互方案"
    python main.py --task "编写产品核心价值" --engine midjourney
    python main.py --task "设计方法论文档" --type design_methodology
    python main.py --list-types
    python main.py --list-engines
    python main.py --stats

参数：
    --task TEXT       任务描述（必需，除非使用 --list-* 或 --stats）
    --engine NAME     AI 引擎（默认 claude，可选 gpt/deepseek/midjourney/dalle/suno）
    --type NAME       手动指定任务类型（覆盖自动匹配）
    --verbose         显示详细路由信息
    --list-types      列出所有任务类型
    --list-engines    列出所有可用引擎
    --stats           显示维度加载统计
    --output FILE     将提示词输出到文件
"""

import argparse
import os
import sys
import io

# 确保可以导入同级模块
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 修复 Windows 控制台 Unicode 输出
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from config import ENGINE_CONFIGS, TASK_ROUTES
from dimension_loader import load_dimensions
from router import DimensionRouter
from assembler import PromptAssembler


def get_project_root() -> str:
    """获取项目根目录（system/ 的父目录）"""
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def cmd_list_types():
    """列出所有任务类型"""
    print("可用任务类型：\n")
    for key, config in TASK_ROUTES.items():
        print(f"  {key:<25} {config['name']}")
        print(f"  {'':25} {config['description']}")
        print(f"  {'':25} 必须: {config['required']}")
        print()


def cmd_list_engines():
    """列出所有引擎"""
    print("可用 AI 引擎：\n")
    for key, config in ENGINE_CONFIGS.items():
        print(f"  {key:<15} {config['name']}")
        print(f"  {'':15} 格式: {config['format']}, 最大 tokens: {config['max_tokens']:,}")
        print()


def cmd_stats(project_root: str):
    """显示维度统计"""
    index = load_dimensions(project_root)
    print("维度加载统计：\n")
    print(index.stats())
    print()

    from config import DIMENSION_CATEGORIES
    for cat in sorted(index.by_category.keys()):
        cat_name = DIMENSION_CATEGORIES.get(cat, "?")
        dims = index.get_by_category(cat)
        print(f"  【{cat}类】{cat_name}（{len(dims)} 个维度）")
        for d in dims:
            status = "✅" if d.is_complete else "⚠️"
            print(f"    {status} {d.id} {d.name} ({d.char_count:,} 字)")
    print()

    if index.load_errors:
        print("❌ 加载错误:")
        for e in index.load_errors:
            print(f"  - {e}")
    if index.load_warnings:
        print("⚠️ 加载警告:")
        for w in index.load_warnings:
            print(f"  - {w}")


def cmd_assemble(
    task: str,
    engine: str,
    task_type: str = None,
    verbose: bool = False,
    output_file: str = None,
):
    """执行提示词组装"""
    project_root = get_project_root()

    # 1. 加载维度
    if verbose:
        print("📂 加载维度文件...\n")
    index = load_dimensions(project_root)

    if index.total_count == 0:
        print("❌ 没有找到任何维度文件！")
        print(f"   请确保 {os.path.join(project_root, 'dimensions')} 目录下有 Markdown 文件。")
        sys.exit(1)

    if verbose:
        print(f"   已加载 {index.total_count} 个维度 "
              f"({index.complete_count} 完整, "
              f"{index.total_count - index.complete_count} 未完成)\n")

    # 2. 路由
    if verbose:
        print("🔀 执行维度路由...\n")
    router = DimensionRouter(index)
    route_result = router.route(task, task_type)

    if verbose:
        print(route_result.summary())
        print()
        print(f"   必须维度: {[d.id + ' ' + d.name for d in route_result.required]}")
        print(f"   建议维度: {[d.id + ' ' + d.name for d in route_result.recommended]}")
        print(f"   可选维度: {[d.id + ' ' + d.name for d in route_result.optional]}")
        print()

    # 3. 组装
    if verbose:
        print(f"🔧 组装提示词 (引擎: {engine})...\n")

    assembler = PromptAssembler(engine=engine)
    prompt = assembler.assemble(route_result)

    # 4. 输出
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(prompt)
        print(f"✅ 提示词已保存到: {output_file}")
        print(f"   长度: {len(prompt):,} 字符")
    else:
        print("=" * 60)
        print(f"📝 生成的提示词 (引擎: {engine}, 长度: {len(prompt):,} 字)")
        print("=" * 60)
        print()
        print(prompt)
        print()
        print("=" * 60)

    # 显示路由摘要
    if route_result.missing_required:
        print(f"\n⚠️ 注意：有 {len(route_result.missing_required)} 个必须维度缺失！")
        for m in route_result.missing_required:
            print(f"   - {m}")


def main():
    parser = argparse.ArgumentParser(
        description="提示词工程系统 v1.0 — 维度驱动的提示词自动组装",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python main.py --task "设计一个化学实验交互方案"
  python main.py --task "编写产品核心价值" --engine midjourney
  python main.py --task "设计方法论文档" --type design_methodology --verbose
  python main.py --task "背景音乐生成" --engine suno
  python main.py --stats
  python main.py --list-types
  python main.py --list-engines
        """,
    )
    parser.add_argument("--task", "-t", type=str, help="任务描述")
    parser.add_argument("--engine", "-e", type=str, default="claude",
                        help=f"AI 引擎 (默认: claude, 可选: {', '.join(ENGINE_CONFIGS.keys())})")
    parser.add_argument("--type", type=str, default=None,
                        help="手动指定任务类型 (覆盖自动匹配)")
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="显示详细路由信息")
    parser.add_argument("--list-types", action="store_true",
                        help="列出所有任务类型")
    parser.add_argument("--list-engines", action="store_true",
                        help="列出所有引擎")
    parser.add_argument("--stats", "-s", action="store_true",
                        help="显示维度统计")
    parser.add_argument("--output", "-o", type=str, default=None,
                        help="输出到文件")

    args = parser.parse_args()

    # 分支命令
    if args.list_types:
        cmd_list_types()
        return

    if args.list_engines:
        cmd_list_engines()
        return

    if args.stats:
        cmd_stats(get_project_root())
        return

    # 主流程
    if not args.task:
        parser.print_help()
        print("\n❌ 请提供 --task 参数，例如：")
        print('   python main.py --task "设计一个化学实验交互方案"')
        sys.exit(1)

    cmd_assemble(
        task=args.task,
        engine=args.engine,
        task_type=args.type,
        verbose=args.verbose,
        output_file=args.output,
    )


if __name__ == "__main__":
    main()
