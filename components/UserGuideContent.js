import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Section = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full text-left font-semibold text-blue-600 hover:text-blue-800 focus:outline-none"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {isOpen && <div className="mt-2">{children}</div>}
    </div>
  );
};

const UserGuideContent = () => {
  return (
    <div className="text-gray-800">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">聽語期刊速報使用指南</h1>
      
      <p className="mb-6 text-lg">
        歡迎使用聽語期刊速報！這個工具旨在幫助您輕鬆瀏覽和查找最新的聽語相關研究文章。以下是使用本工具的簡要指南：
      </p>
      
      <Section title="1. 主頁面概覽">
        <p>當您打開聽語期刊速報，您會看到以下主要部分：</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
          <li>頁面頂部的標題和搜索欄</li>
          <li>統計信息和過濾選項</li>
          <li>文章列表</li>
          <li>頁面底部的分頁按鈕</li>
        </ul>
      </Section>

      <Section title="2. 搜索文章">
        <ol className="list-decimal list-inside ml-4 space-y-1">
          <li>在頁面頂部的搜索欄中輸入關鍵字。</li>
          <li>點擊搜索按鈕（放大鏡圖標）或按 Enter 鍵。</li>
          <li>系統將顯示標題、翻譯標題、摘要或關鍵字中包含您搜索詞的文章。</li>
        </ol>
      </Section>

      <Section title="3. 過濾文章">
        <h3 className="font-semibold mt-2 mb-1">按期刊過濾</h3>
        <ol className="list-decimal list-inside ml-4 space-y-1">
          <li>使用「所有期刊」下拉菜單選擇特定的期刊。</li>
          <li>文章列表將更新以僅顯示所選期刊的文章。</li>
        </ol>
        <h3 className="font-semibold mt-4 mb-1">按時間範圍過濾</h3>
        <p>點擊「最近一周」或「最近一月」按鈕以查看相應時間範圍內的文章。</p>
        <h3 className="font-semibold mt-4 mb-1">使用關鍵字標籤</h3>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>每篇文章下方都有關鍵字標籤。</li>
          <li>點擊任何關鍵字標籤以查看包含該關鍵字的所有文章。</li>
        </ul>
      </Section>

      <Section title="4. 排序文章">
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>點擊「時間降序」或「時間升序」按鈕來改變文章的排序方式。</li>
          <li>箭頭向上表示從舊到新，箭頭向下表示從新到舊。</li>
        </ul>
      </Section>

      <Section title="5. 閱讀文章詳情">
        <p>每篇文章卡片包含以下信息：</p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
          <li>英文標題（點擊可跳轉到原文，如果有 DOI 的話）</li>
          <li>中文翻譯標題</li>
          <li>TL;DR（太長不讀）摘要</li>
          <li>關鍵字標籤</li>
          <li>PubMed 連結、來源期刊和發布日期</li>
        </ul>
      </Section>

      <Section title="6. 瀏覽更多文章">
        <p>使用頁面底部的數字按鈕在不同頁面間切換。</p>
      </Section>

      <div className="mt-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
        <h2 className="font-bold text-lg mb-2">注意事項</h2>
        <p>
          <strong>⚠️ 警告：</strong>AI 生成的 TL;DR 摘要和中文翻譯可能存在錯誤或不準確之處。為確保信息準確性，建議您參考原文內容。
        </p>
      </div>

      <p className="mt-8 text-gray-600 italic">
        我們希望這個工具能幫助您更輕鬆地跟進最新的聽語研究。如果您有任何問題或建議，請隨時與我們聯繫。祝您使用愉快！
      </p>
    </div>
  );
};

export default UserGuideContent;
